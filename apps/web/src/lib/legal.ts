/**
 * Identificação do responsável pelo Budega, exibida na Política de Privacidade e nos
 * Termos de Uso. A LGPD exige identificar o controlador e o encarregado (arts. 9º, III,
 * e 41), e o Decreto 7.962/2013 pede nome, CNPJ (ou CPF, se pessoa física) e endereço de
 * quem oferece o serviço.
 *
 * PREENCHA antes de publicar o site — enquanto houver campos vazios, as páginas legais
 * mostram um aviso de "dados pendentes".
 */
export const LEGAL = {
  /** Razão social (ou nome completo, se pessoa física). */
  controllerName: "Luis Artur Lobo de Montanha",
  /** CNPJ (ou CPF, se pessoa física). */
  controllerDocument: "076.522.853-05",
  /**
   * Endereço completo para correspondência. Bairro/CEP não foram informados ainda —
   * complete se quiser o endereço completo nas páginas legais.
   */
  controllerAddress: "Rua José Alexandre, 17 — Fortaleza/CE",
  /** Telefone de contato (WhatsApp/ligação). */
  contactPhone: "(85) 98162-6272",
  /** E-mail para assuntos de privacidade (atendimento aos titulares — art. 18). */
  privacyEmail: "luis19artur@gmail.com",
  /** Nome do encarregado pelo tratamento de dados (DPO — art. 41). */
  dpoName: "Luis Artur Lobo de Montanha",
  /** E-mail para mercados pedirem correção ou remoção de conteúdo. */
  contentEmail: "luis19artur@gmail.com",
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
