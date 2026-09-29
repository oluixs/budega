/**
 * Cliente HTTP usado por todas as fontes. Regras de boa convivência com os sites dos
 * mercados (ver README > Fontes de dados):
 * - identifica-se como BudegaBot, com link para o projeto;
 * - consulta o robots.txt de cada site e não acessa caminhos proibidos;
 * - só lê páginas/endpoints públicos que o próprio site usa para os visitantes;
 * - tempo limite por requisição, para uma fonte lenta não travar as outras.
 */

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export const USER_AGENT = "Mozilla/5.0 (compatible; BudegaBot/0.1; +https://github.com/oluixs/budega)";
const BOT_TOKEN = "budegabot";

export class RobotsDisallowedError extends Error {
  constructor(url: string) {
    super(`robots.txt do site não permite acessar ${url}`);
    this.name = "RobotsDisallowedError";
  }
}

interface RobotsRules {
  allow: string[];
  disallow: string[];
}

/**
 * Interpreta um robots.txt e devolve as regras do grupo mais específico que se aplica
 * ao BudegaBot (o grupo "budegabot" se existir, senão "*").
 */
export function parseRobots(content: string): RobotsRules {
  const groups = new Map<string, RobotsRules>();
  let agents: string[] = [];
  let lastWasAgent = false;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (key === "user-agent") {
      if (!lastWasAgent) agents = [];
      agents.push(value.toLowerCase());
      for (const agent of agents) if (!groups.has(agent)) groups.set(agent, { allow: [], disallow: [] });
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if ((key === "allow" || key === "disallow") && agents.length) {
      for (const agent of agents) {
        const rules = groups.get(agent)!;
        if (value) (key === "allow" ? rules.allow : rules.disallow).push(value);
      }
    }
  }

  const specific = [...groups.entries()].find(([agent]) => agent !== "*" && BOT_TOKEN.includes(agent));
  return specific?.[1] ?? groups.get("*") ?? { allow: [], disallow: [] };
}

/** Regra mais longa vence; empate favorece Allow (como o Google interpreta). */
export function isPathAllowed(rules: RobotsRules, path: string): boolean {
  const longest = (patterns: string[]) =>
    Math.max(-1, ...patterns.filter((pattern) => path.startsWith(pattern.replace(/\*$/, ""))).map((p) => p.length));
  return longest(rules.allow) >= longest(rules.disallow);
}

export interface HttpClient {
  getJson<T>(url: string): Promise<T>;
  getBuffer(url: string): Promise<ArrayBuffer>;
}

export interface HttpClientOptions {
  fetch?: FetchLike;
  timeoutMs?: number;
  /** Repassado ao fetch (ex.: `{ next: { revalidate: 3600 } }` no Next.js). */
  requestInit?: RequestInit & Record<string, unknown>;
}

export function createHttpClient({ fetch = globalThis.fetch, timeoutMs = 20_000, requestInit = {} }: HttpClientOptions = {}): HttpClient {
  const robotsByOrigin = new Map<string, Promise<RobotsRules>>();

  function robotsFor(origin: string): Promise<RobotsRules> {
    let pending = robotsByOrigin.get(origin);
    if (!pending) {
      pending = fetch(`${origin}/robots.txt`, {
        ...requestInit,
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(timeoutMs),
      })
        .then(async (response) => {
          const body = response.ok ? await response.text() : "";
          // Sites que respondem o robots.txt com uma página HTML (404 "bonito") não têm regras.
          return body.trimStart().startsWith("<") ? { allow: [], disallow: [] } : parseRobots(body);
        })
        .catch(() => ({ allow: [], disallow: [] }));
      robotsByOrigin.set(origin, pending);
    }
    return pending;
  }

  async function request(url: string, accept: string): Promise<Response> {
    const parsed = new URL(url);
    if (!isPathAllowed(await robotsFor(parsed.origin), parsed.pathname)) throw new RobotsDisallowedError(url);
    const response = await fetch(url, {
      ...requestInit,
      headers: { "User-Agent": USER_AGENT, Accept: accept },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} em ${url}`);
    return response;
  }

  return {
    async getJson<T>(url: string) {
      return (await (await request(url, "application/json")).json()) as T;
    },
    async getBuffer(url: string) {
      return (await request(url, "*/*")).arrayBuffer();
    },
  };
}
