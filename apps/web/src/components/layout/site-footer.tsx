import Link from "next/link";
import { isCatalogMode } from "@/lib/env";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-300/70 bg-neutral-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-body text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>&copy; {new Date().getFullYear()} Budega. Todos os direitos reservados.</p>
        <nav className="flex flex-wrap gap-4" aria-label="Links institucionais">
          <Link href="/privacidade" className="hover:text-brand-600">
            Política de Privacidade
          </Link>
          <Link href="/termos" className="hover:text-brand-600">
            Termos de Uso
          </Link>
          {/* Sem painel publicado, o mercado pede correção/remoção pelo canal dos Termos. */}
          <Link href={isCatalogMode ? "/termos#propriedade" : "/admin"} className="hover:text-brand-600">
            Sou um mercado
          </Link>
        </nav>
      </div>
    </footer>
  );
}
