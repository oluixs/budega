import type { RegionalData } from "../types/index";
import snapshot from "./regional.json";

/**
 * Último retrato dos dados reais da região (mercados, lojas, encartes e ofertas),
 * importado dos sites oficiais por `pnpm importar` (packages/sources). A web ainda
 * atualiza isso sozinha em tempo de execução; o app usa este arquivo (ou a API da web).
 */
export const regionalSnapshot = snapshot as unknown as RegionalData;
