import { z } from "zod";

/**
 * ID de um registro escolhido num select ou vindo da rota. Não usamos `.uuid()`: os dados
 * mock usam IDs legíveis (ex.: "mkt-bompreco-pinheiros"), o que tornava os formulários do
 * admin impossíveis de enviar em modo mock (ver .audit/errors/2026-09-29/). O formulário só
 * precisa garantir que algo foi selecionado — no Supabase real, as colunas `uuid` já
 * rejeitam valores inválidos.
 */
export function recordIdSchema(message = "Selecione um item") {
  return z.string().min(1, message);
}
const optionalRecordId = z.string().min(1).nullable().optional();

function coordinateSchema(label: "latitude" | "longitude", limit: number) {
  const message = `Informe a ${label} (entre -${limit} e ${limit})`;
  return z
    .number({ required_error: message, invalid_type_error: message })
    .min(-limit, message)
    .max(limit, message);
}

export const openingHoursSchema = z.object({
  day: z.number().min(0).max(6),
  opens_at: z.string().nullable(),
  closes_at: z.string().nullable(),
  closed: z.boolean(),
});

export const marketFormSchema = z.object({
  name: z.string().min(2, "Informe o nome do mercado").max(120),
  description: z.string().max(500).optional().nullable(),
  logo_url: z.string().url("URL inválida").optional().nullable(),
  phone: z.string().min(8, "Telefone inválido").optional().nullable(),
  whatsapp: z.string().min(8, "WhatsApp inválido").optional().nullable(),
  address: z.string().min(4, "Informe o endereço"),
  neighborhood: z.string().min(2, "Informe o bairro"),
  city: z.string().min(2, "Informe a cidade"),
  state: z.string().length(2, "UF deve ter 2 letras"),
  postal_code: z.string().min(8, "CEP inválido"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  opening_hours: z.array(openingHoursSchema).default([]),
  is_verified: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  is_suspended: z.boolean().default(false),
});
export type MarketFormValues = z.infer<typeof marketFormSchema>;

export const branchFormSchema = z.object({
  market_id: recordIdSchema("Selecione um mercado"),
  name: z.string().min(2, "Informe o nome da filial"),
  address: z.string().min(4, "Informe o endereço"),
  neighborhood: z.string().min(2, "Informe o bairro"),
  city: z.string().min(2, "Informe a cidade"),
  state: z.string().length(2, "UF deve ter 2 letras"),
  postal_code: z.string().min(8, "CEP inválido"),
  latitude: coordinateSchema("latitude", 90),
  longitude: coordinateSchema("longitude", 180),
  phone: z.string().optional().nullable(),
  opening_hours: z.array(openingHoursSchema).default([]),
});
export type BranchFormValues = z.infer<typeof branchFormSchema>;

export const flyerFormSchema = z
  .object({
    market_id: recordIdSchema("Selecione um mercado"),
    branch_id: optionalRecordId,
    title: z.string().min(2, "Informe um título"),
    file_url: z.string().url("Envie um arquivo válido"),
    file_type: z.enum(["pdf", "image"]),
    valid_from: z.string().min(1, "Informe a data de início"),
    valid_until: z.string().min(1, "Informe a validade"),
    status: z.enum(["active", "paused", "archived"]).default("active"),
  })
  .refine((data) => new Date(data.valid_until) > new Date(data.valid_from), {
    message: "A validade deve ser depois da data de início",
    path: ["valid_until"],
  });
export type FlyerFormValues = z.infer<typeof flyerFormSchema>;

export const offerFormSchema = z
  .object({
    market_id: recordIdSchema("Selecione um mercado"),
    branch_id: optionalRecordId,
    category_id: recordIdSchema("Selecione uma categoria"),
    name: z.string().min(2, "Informe o nome do produto"),
    description: z.string().max(300).optional().nullable(),
    image_url: z.string().url("URL inválida").optional().nullable(),
    promotional_price: z.number().positive("Informe um preço válido"),
    regular_price: z.number().positive().optional().nullable(),
    unit: z.string().min(1, "Informe a unidade (ex.: kg, un, L)"),
    conditions: z.string().max(300).optional().nullable(),
    // Oferta sem validade não pode ser publicada (regra de negócio 10.1).
    valid_from: z.string().min(1, "Informe a data de início"),
    valid_until: z.string().min(1, "A validade é obrigatória"),
    is_featured: z.boolean().default(false),
  })
  .refine((data) => new Date(data.valid_until) > new Date(data.valid_from), {
    message: "A validade deve ser depois da data de início",
    path: ["valid_until"],
  })
  .refine(
    (data) => !data.regular_price || data.regular_price > data.promotional_price,
    {
      message: "O preço anterior deve ser maior que o preço promocional",
      path: ["regular_price"],
    },
  );
export type OfferFormValues = z.infer<typeof offerFormSchema>;

export const reportFormSchema = z.object({
  market_id: optionalRecordId,
  flyer_id: optionalRecordId,
  offer_id: optionalRecordId,
  reason: z.enum([
    "preco_incorreto",
    "oferta_vencida",
    "mercado_incorreto",
    "conteudo_inadequado",
    "encarte_ilegivel",
  ]),
  description: z.string().max(500).optional().nullable(),
});
export type ReportFormValues = z.infer<typeof reportFormSchema>;

export const locationSearchSchema = z.object({
  query: z.string().min(2, "Digite um endereço ou bairro").optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
export type LocationSearchValues = z.infer<typeof locationSearchSchema>;

export const authSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});
export type AuthValues = z.infer<typeof authSchema>;

export const signUpSchema = authSchema.extend({
  name: z.string().min(2, "Informe seu nome"),
});
export type SignUpValues = z.infer<typeof signUpSchema>;

/** Uploads devem validar tipo e tamanho (regra de negócio 10.10). */
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_FLYER_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];

export function validateUpload(
  file: { type: string; size: number },
  allowedTypes: string[],
): { valid: true } | { valid: false; error: string } {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Tipo de arquivo não permitido." };
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { valid: false, error: "Arquivo maior que 10MB." };
  }
  return { valid: true };
}
