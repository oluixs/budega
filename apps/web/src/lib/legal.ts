/**
 * Identificação do responsável pelo Budega, exibida na Política de Privacidade e nos
 * Termos de Uso. A LGPD exige identificar o controlador e o encarregado (arts. 9º, III,
 * e 41), e o Decreto 7.962/2013 pede nome, CNPJ e endereço de quem oferece o serviço.
 *
 * PREENCHA antes de publicar o site — enquanto houver campos vazios, as páginas legais
 * mostram um aviso de "dados pendentes".
 */
export const LEGAL = {
  /** Razão social (ou nome completo, se pessoa física). */
  controllerName: "",
  /** CNPJ (ou CPF, se pessoa física). */
  controllerDocument: "",
  /** Endereço completo para correspondência. */
  controllerAddress: "",
  /** E-mail para assuntos de privacidade (atendimento aos titulares — art. 18). */
  privacyEmail: "",
  /** Nome do encarregado pelo tratamento de dados (DPO — art. 41). */
  dpoName: "",
  /** E-mail para mercados pedirem correção ou remoção de conteúdo. */
  contentEmail: "",
  lastUpdated: "29 de setembro de 2026",
};

export const legalPending = [
  LEGAL.controllerName,
  LEGAL.controllerDocument,
  LEGAL.controllerAddress,
  LEGAL.privacyEmail,
  LEGAL.dpoName,
  LEGAL.contentEmail,
].some((value) => !value.trim());

/** Mostra o valor ou um marcador visível de pendência. */
export function legalValue(value: string): string {
  return value.trim() || "[a preencher em apps/web/src/lib/legal.ts]";
}
