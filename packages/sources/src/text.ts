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
    .map((word, index) => {
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word;
      const isAcronym = /^[a-z]+$/.test(word) && (word.length === 1 || !/[aeiouy]/.test(word));
      if (isAcronym && index > 0) return word.toLocaleUpperCase("pt-BR");
      return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);
    })
    .join(" ");
}
