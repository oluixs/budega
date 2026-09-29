import { AlertTriangle } from "lucide-react";
import { legalPending } from "@/lib/legal";

/** Estrutura comum das páginas legais (título, data e aviso de dados pendentes). */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-neutral-900">{title}</h1>
      <p className="mt-2 text-body text-neutral-500">Última atualização: {updated}</p>

      {legalPending && (
        <p
          role="note"
          className="mt-6 flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-4 text-body text-neutral-700"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          Documento em preparação: a identificação do responsável pelo Budega (razão social,
          CNPJ, endereço e contatos) ainda precisa ser preenchida antes do lançamento.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-8 text-body-lg text-neutral-700">{children}</div>
    </div>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="font-display text-h2 font-semibold text-neutral-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
