import type { Branch, Coordinates, OpeningHours } from "@budega/shared";

/**
 * Parsers dos textos livres que os sites dos mercados publicam (validade de encarte,
 * horário de funcionamento, endereço). Tudo aqui é função pura e testada em
 * parse.test.ts — é a parte mais sujeita a quebrar quando um site muda o texto.
 */

const TZ_OFFSET = "-03:00"; // America/Sao_Paulo (sem horário de verão desde 2019)

/** Minúsculas, sem acentos e com espaços normalizados — para comparar textos. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const MONTHS: Record<string, number> = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function localIso(year: number, month: number, day: number, time: string): string {
  return new Date(`${year}-${pad(month)}-${pad(day)}T${time}${TZ_OFFSET}`).toISOString();
}

function isValidDay(month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1) return false;
  // Ano bissexto como referência: aceita 29/02; o ano real vem depois.
  const daysInMonth = new Date(Date.UTC(2024, month, 0)).getUTCDate();
  return day <= daysInMonth;
}

/**
 * Lê períodos como "Ofertas válidas de 29/09 a 05/10", "de 27 a 29/09",
 * "de 16 a 30 de setembro" ou "de 28/12/2026 a 03/01/2027". O ano, quando ausente, vem
 * da data de publicação (`referenceIso`), virando o ano se o período cruzar dezembro.
 * Retorna o início às 00:00 e o fim às 23:59:59 no horário de Brasília, ou `null`.
 */
export function parseValidity(text: string, referenceIso: string): { valid_from: string; valid_until: string } | null {
  // "28.09" / "04.10.2026" (Frangolândia) → mesma forma de "28/09" / "04/10/2026".
  const source = normalize(text).replace(/(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/g, (_, d, m, y) =>
    y ? `${d}/${m}/${y}` : `${d}/${m}`,
  );
  // "de" antes do período é opcional ("26 a 29/09 de 2026"); ano pode vir no fim.
  const match = source.match(
    /(?:^|[^\d/])(\d{1,2})(?:\/(\d{1,2})(?:\/(\d{2,4}))?)? (?:a|ate) (\d{1,2})(?:\/(\d{1,2})(?:\/(\d{2,4}))?| de ([a-z]+))(?: de (\d{4}))?/,
  );
  if (!match) return null;

  const [, d1, m1, y1, d2, m2, y2Inline, monthName, yearAtEnd] = match;
  const y2 = y2Inline ?? yearAtEnd;
  const endMonth = m2 ? Number(m2) : monthName ? MONTHS[monthName] : undefined;
  if (!endMonth) return null;
  const startMonth = m1 ? Number(m1) : endMonth;
  const startDay = Number(d1);
  const endDay = Number(d2);
  if (!isValidDay(startMonth, startDay) || !isValidDay(endMonth, endDay)) return null;

  const reference = new Date(referenceIso);
  const refYear = reference.getUTCFullYear();
  const fullYear = (value: string | undefined) =>
    value ? (value.length === 2 ? 2000 + Number(value) : Number(value)) : undefined;

  let startYear = fullYear(y1) ?? (y2 ? fullYear(y2)! - (endMonth < startMonth ? 1 : 0) : refYear);
  // Publicado em janeiro para um período que começou em dezembro.
  if (!y1 && !y2 && startMonth - (reference.getUTCMonth() + 1) > 6) startYear -= 1;
  let endYear = fullYear(y2) ?? startYear;
  if (!y2 && endMonth < startMonth) endYear += 1;

  const valid_from = localIso(startYear, startMonth, startDay, "00:00:00");
  const valid_until = localIso(endYear, endMonth, endDay, "23:59:59");
  if (new Date(valid_until) <= new Date(valid_from)) return null;
  return { valid_from, valid_until };
}

// Prefixos de 3 letras: cobrem "segunda"/"seg", "sábado"/"sab", "domingos" etc.
const DAY_PREFIXES = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
const dayOf = (word: string): number | null => {
  const index = DAY_PREFIXES.indexOf(word.slice(0, 3));
  return index < 0 ? null : index;
};

function daysFor(spec: string): number[] | null {
  const text = spec.replace(/-feira/g, "").trim();
  if (/diariamente|todos os dias|todo(?: o)? dia/.test(text)) return [0, 1, 2, 3, 4, 5, 6];
  const range = text.match(/([a-z]+) (?:a|ate) ([a-z]+)/);
  if (range) {
    const start = dayOf(range[1]!);
    const end = dayOf(range[2]!);
    if (start !== null && end !== null) {
      const days: number[] = [];
      for (let day = start; ; day = (day + 1) % 7) {
        days.push(day);
        if (day === end) break;
      }
      return days;
    }
  }
  const single = [...new Set(text.split(/[^a-z]+/).map(dayOf).filter((day): day is number => day !== null))];
  return single.length ? single : null;
}

function toTime(hours: string, minutes: string | undefined, isClosing: boolean): string {
  const h = Number(hours);
  // "às 00h"/"às 24h" como fechamento = meia-noite; 23:59 mantém o mesmo dia.
  if (isClosing && (h === 0 || h === 24) && !Number(minutes ?? 0)) return "23:59";
  return `${pad(h)}:${pad(Number(minutes ?? 0))}`;
}

/**
 * Lê horários como "Diariamente das 06h às 00h",
 * "Segunda a sábado das 6h às 00h • Domingo das 6h às 23h" (Cometa) ou
 * "Seg à Sab: 06:00 às 00:00 Domingos e Feriados: Fechado" (Frangolândia). Dias não
 * citados ficam fechados. Texto que não der para entender → `[]` (horário desconhecido).
 */
export function parseOpeningHours(text: string): OpeningHours[] {
  const source = normalize(text);
  const byDay = new Map<number, OpeningHours>();
  const pattern =
    /([a-z][a-z ,-]*?)\s*(?::|\bdas\b)\s*(?:(fechad[oa])|(\d{1,2})(?:h|:)(\d{2})?h?\s+(?:as|a)\s+(\d{1,2})(?:h|:)(\d{2})?h?)/g;

  for (const match of source.matchAll(pattern)) {
    const days = daysFor(match[1]!);
    if (!days) continue;
    for (const day of days) {
      if (match[2]) {
        byDay.set(day, { day, opens_at: null, closes_at: null, closed: true });
      } else {
        byDay.set(day, {
          day,
          opens_at: toTime(match[3]!, match[4], false),
          closes_at: toTime(match[5]!, match[6], true),
          closed: false,
        });
      }
    }
  }

  if (byDay.size === 0) return [];
  return Array.from({ length: 7 }, (_, day) => byDay.get(day) ?? { day, opens_at: null, closes_at: null, closed: true });
}

/** Cidades da Região Metropolitana de Fortaleza que aparecem no lugar do bairro. */
const METRO_CITIES = [
  "Aquiraz", "Caucaia", "Eusébio", "Horizonte", "Itaitinga", "Maracanaú",
  "Maranguape", "Pacajus", "Pacatuba", "São Gonçalo do Amarante",
];

/**
 * Separa "Rua Ildefonso Albano, 2260 – Aldeota" em endereço e bairro. Quando o "bairro"
 * é uma cidade da região metropolitana (ex.: "- Maracanaú"), ele vira a cidade.
 */
export function parseAddress(raw: string, defaultCity: string): { address: string; neighborhood: string; city: string } {
  const text = raw.replace(/\s+/g, " ").trim();
  // Traço com espaço de pelo menos um lado ("X - Y", "X -Y", "X – Y"); hífen colado
  // ("Guarany-Mirim") não separa.
  const parts = text.split(/\s+[–-]\s*|\s*[–-]\s+/);
  if (parts.length < 2) return { address: text, neighborhood: "", city: defaultCity };

  const last = parts[parts.length - 1]!.trim();
  const address = parts.slice(0, -1).join(" - ").trim();
  const city = METRO_CITIES.find((name) => normalize(name) === normalize(last));
  if (city) return { address, neighborhood: "", city };
  return { address, neighborhood: last, city: defaultCity };
}

/** "-3.7406, -38.5161" → coordenadas (ou `null` se inválido/fora do planeta). */
export function parseCoordinates(raw: string | null | undefined): Coordinates | null {
  if (!raw) return null;
  const [lat, lng] = raw.split(",").map((part) => Number(part.trim()));
  if (lat === undefined || lng === undefined || Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180 || (lat === 0 && lng === 0)) return null;
  return { latitude: lat, longitude: lng };
}

/** "(85) 3231-7740" → "8532317740". */
export function normalizePhone(raw: string | null | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

/**
 * Encarte "somente para a loja Montese" → filial daquela loja (por bairro ou nome).
 * Encartes para todas as lojas (inclusive "exceto X") → `null` (vale para o mercado).
 */
export function findRestrictedBranch(description: string, branches: Branch[]): string | null {
  const match = normalize(description).match(/somente (?:para |na |no |em )?(?:a |o )?(?:loja|unidade)s? (.+)/);
  if (!match) return null;
  const target = match[1]!;
  const found = branches.find((branch) => {
    const neighborhood = normalize(branch.neighborhood);
    const name = normalize(branch.name).replace(/^loja /, "");
    return (neighborhood && target.includes(neighborhood)) || (name && target.startsWith(name));
  });
  return found?.id ?? null;
}
