import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Category, Flyer, Offer } from "@budega/shared";
import type { HttpClient } from "../http";

/**
 * Lê produtos e preços da imagem/PDF de um encarte com um modelo de visão (API do Claude).
 *
 * Por que não OCR: os encartes do Cometa e da Frangolândia são artes gráficas com preços
 * estilizados ("4" grande + ",05" pequeno); o Tesseract foi testado e não lê os preços
 * (.audit/changes/2026-09-29). Um preço errado é pior que nenhum, então o modelo é
 * instruído a PULAR o que não estiver legível, e toda oferta sai marcada
 * `origin: "encarte"` — a interface avisa para conferir no encarte original.
 *
 * Custo: roda só com `pnpm importar --ofertas` (opt-in explícito) e cada encarte é lido
 * uma única vez (cache em data/offers-cache.json, versionado).
 */

export const OFFER_EXTRACTION_MODEL = "claude-opus-5-5";

const ExtractedOfferSchema = z.object({
  name: z.string().min(2),
  brand: z.string().nullable(),
  size: z.string().nullable(),
  promotional_price: z.number().positive(),
  regular_price: z.number().positive().nullable(),
  unit: z.string().min(1),
  category_slug: z.string(),
  conditions: z.string().nullable(),
});
const ExtractionSchema = z.object({ offers: z.array(ExtractedOfferSchema) });
export type ExtractedOffer = z.infer<typeof ExtractedOfferSchema>;

/** JSON Schema da saída estruturada (espelha o zod acima; o zod valida de novo na volta). */
function outputSchema(categorySlugs: string[]) {
  const nullableString = { type: ["string", "null"] };
  return {
    type: "object",
    additionalProperties: false,
    required: ["offers"],
    properties: {
      offers: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "brand", "size", "promotional_price", "regular_price", "unit", "category_slug", "conditions"],
          properties: {
            name: { type: "string", description: "Produto, sem marca e sem tamanho (ex.: \"Arroz branco\")" },
            brand: { ...nullableString, description: "Marca como impressa (ex.: \"Célia\")" },
            size: { ...nullableString, description: "Tamanho/peso/volume (ex.: \"1kg\", \"900ml\", \"cx 6un\")" },
            promotional_price: { type: "number", description: "Preço da oferta em reais (ex.: 4.05)" },
            regular_price: { type: ["number", "null"], description: "Preço anterior (\"de\", riscado ou menor ao lado), se impresso" },
            unit: { type: "string", description: "kg, un, L, pct, cx, dz… (\"cada\" = un)" },
            category_slug: { type: "string", enum: categorySlugs },
            conditions: { ...nullableString, description: "Condições impressas (ex.: \"exceto zero lactose\", \"clube\")" },
          },
        },
      },
    },
  };
}

const PROMPT = `Esta é a imagem de um encarte de supermercado brasileiro.
Liste as ofertas de produtos cujo preço esteja claramente legível.

Regras:
- Preço em reais como número: "4,05" → 4.05. Nos encartes o preço costuma vir estilizado, com os centavos menores ao lado ou acima dos reais ("4" + "05" = 4.05).
- Preço anterior ("de R$", riscado, ou o valor menor acima do preço principal) em regular_price; se não houver, null.
- Se você não tiver certeza de qualquer dígito do preço de um produto, NÃO inclua esse produto. Um preço errado prejudica quem compra; omitir é melhor.
- Não invente marca, tamanho ou condição que não esteja impressa.
- Ignore banners institucionais, cupons, sorteios e produtos sem preço.`;

function mediaType(url: string, contentType: string | null): "image/jpeg" | "image/png" | "image/webp" | "application/pdf" {
  const value = (contentType ?? "").toLowerCase();
  if (value.includes("pdf") || /\.pdf($|\?)/i.test(url)) return "application/pdf";
  if (value.includes("png") || /\.png($|\?)/i.test(url)) return "image/png";
  if (value.includes("webp") || /\.webp($|\?)/i.test(url)) return "image/webp";
  return "image/jpeg";
}

export interface ExtractionResult {
  offers: Offer[];
  usage: { input_tokens: number; output_tokens: number };
  /** Ofertas descartadas na validação (preço inválido, categoria desconhecida…). */
  discarded: number;
}

export interface ExtractOptions {
  client: Anthropic;
  http: HttpClient;
  flyer: Flyer;
  categories: Category[];
}

export async function extractOffersFromFlyer({ client, http, flyer, categories }: ExtractOptions): Promise<ExtractionResult> {
  // Download pelo nosso cliente (robots.txt, identificação) e envio em base64.
  const file = Buffer.from(await http.getBuffer(flyer.file_url)).toString("base64");
  const type = mediaType(flyer.file_url, null);
  const source =
    type === "application/pdf"
      ? ({ type: "document", source: { type: "base64", media_type: "application/pdf", data: file } } as const)
      : ({ type: "image", source: { type: "base64", media_type: type, data: file } } as const);

  const response = await client.beta.messages.create({
    model: OFFER_EXTRACTION_MODEL,
    max_tokens: 16000,
    // Leitura cuidadosa de preços: esforço explícito (o padrão deste modelo é "medium").
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: outputSchema(categories.map((category) => category.slug)) },
    },
    // Se o modelo recusar por política, a API tenta de novo em outro modelo na mesma chamada.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: [{ role: "user", content: [source, { type: "text", text: PROMPT }] }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error(`Leitura recusada (${response.stop_details?.category ?? "sem categoria"}).`);
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("Resposta cortada (max_tokens) — encarte grande demais para uma leitura.");
  }
  const text = response.content.find((block) => block.type === "text");
  if (!text || text.type !== "text") throw new Error("Resposta sem conteúdo de texto.");

  const parsed = ExtractionSchema.safeParse(JSON.parse(text.text));
  if (!parsed.success) throw new Error("Resposta fora do formato esperado.");

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category.id]));
  // Sanidade contra vírgula perdida ("2,79" lido como 279). Em mercearia, preço acima de
  // R$ 500 ou inteiro acima de R$ 100 (sem centavos) é quase sempre leitura errada.
  // Eletro/utilidades (ex.: Cometa Presentes) têm teto maior e sem a regra dos centavos.
  const FOOD = ["alimentos", "bebidas", "hortifruti", "carnes", "padaria"];
  const implausible = (slug: string, price: number) =>
    FOOD.includes(slug) ? price > 500 || (price >= 100 && Number.isInteger(price)) : price > 10_000;
  const offers: Offer[] = [];
  let discarded = 0;
  parsed.data.offers.forEach((item, index) => {
    const categoryId = categoryBySlug.get(item.category_slug);
    const regular = item.regular_price && item.regular_price > item.promotional_price ? item.regular_price : null;
    if (!categoryId || implausible(item.category_slug, item.promotional_price)) {
      discarded += 1;
      return;
    }
    offers.push({
      id: `${flyer.id}-oferta-${index + 1}`,
      market_id: flyer.market_id,
      branch_id: flyer.branch_id,
      flyer_id: flyer.id,
      origin: "encarte",
      category_id: categoryId,
      name: [item.name, item.brand].filter(Boolean).join(" "),
      description: item.size,
      image_url: null,
      promotional_price: Math.round(item.promotional_price * 100) / 100,
      regular_price: regular,
      unit: item.unit,
      conditions: item.conditions,
      valid_from: flyer.valid_from,
      valid_until: flyer.valid_until,
      is_active: true,
      is_featured: false,
      created_at: flyer.created_at,
      updated_at: flyer.updated_at,
    });
  });

  return {
    offers,
    usage: { input_tokens: response.usage.input_tokens, output_tokens: response.usage.output_tokens },
    discarded,
  };
}
