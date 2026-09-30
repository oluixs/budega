import { PROJECT_REPO_URL } from "@budega/shared";
import { isMockMode } from "./env";

/**
 * Sem Supabase o Budega é só um catálogo: sem contas, denúncias ou métricas guardadas, e
 * as páginas legais usam a versão "catálogo" (sem tratamento de dados pessoais pelo
 * projeto além dos registros técnicos da hospedagem). Com contas, a identificação abaixo
 * passa a ser obrigatória.
 */
export const hasAccounts = !isMockMode;

/**
 * Identificação do responsável pelo Budega, exibida na Política de Privacidade e nos
 * Termos de Uso. A LGPD exige identificar o controlador e o encarregado (arts. 9º, III,
 * e 41), e o Decreto 7.962/2013 pede nome, CNPJ e endereço de quem oferece o serviço.
 *
 * PREENCHA antes de ativar contas (Supabase) — enquanto houver campos vazios, as páginas
 * legais mostram um aviso de "dados pendentes".
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
  /** Onde fica o código e onde abrir avisos (versão catálogo). */
  repoUrl: PROJECT_REPO_URL,
};

/** Hospedagem do site (aparece nas páginas legais: recebe os registros de acesso). */
export const HOSTING = {
  name: "Vercel",
  country: "Estados Unidos",
  privacyUrl: "https://vercel.com/legal/privacy-policy",
};

export const legalPending = hasAccounts && [
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
