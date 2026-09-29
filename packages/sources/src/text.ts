const LOWERCASE_WORDS = new Set(["a", "as", "o", "os", "e", "de", "da", "das", "do", "dos", "em", "na", "no", "para", "pra", "com"]);

/**
 * "OFERTAS EXCLUSIVAS MONTESE" → "Ofertas Exclusivas Montese". Siglas (palavra de uma
 * letra ou sem vogal, como "M" e "JSB") continuam em maiúsculas.
 */
export function titleCase(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR")
    .split(" ")
    .map((word, index, words) => {
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word;
      const isAcronym = /^[a-z]+$/.test(word) && (word.length === 1 || !/[aeiouy]/.test(word));
      if (isAcronym && index > 0) return word.toLocaleUpperCase("pt-BR");
      // Sigla de rodovia antes do número: "CE 085", "BR-116".
      const next = words[index + 1] ?? "";
      if (/^(ce|br)$/.test(word) && /^\d/.test(next)) return word.toLocaleUpperCase("pt-BR");
      if (/^(ce|br)-\d+$/.test(word)) return word.toLocaleUpperCase("pt-BR");
      // Primeira LETRA da palavra ("(pátio" → "(Pátio").
      return word.replace(/^([^\p{L}]*)(\p{L})/u, (_, prefix: string, letter: string) => prefix + letter.toLocaleUpperCase("pt-BR"));
    })
    .join(" ");
}
