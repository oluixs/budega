/**
 * Dados mock usam datas relativas a "agora" para que ofertas/encartes ativos e
 * vencidos continuem fazendo sentido não importa quando o app for executado.
 */
export function daysFromNow(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}
