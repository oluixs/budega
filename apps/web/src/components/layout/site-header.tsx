import Link from "next/link";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";

const NAV_LINKS = [
  { href: "/explorar", label: "Explorar" },
  { href: "/favoritos", label: "Favoritos" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-300/70 bg-neutral-50/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-50/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-brand-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-500 text-neutral-0">
            <Store className="h-5 w-5" aria-hidden="true" />
          </span>
          Budega
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-body-lg font-medium text-neutral-700 transition-colors hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" render={<Link href="/entrar" />}>
            Entrar
          </Button>
          <Button render={<Link href="/explorar" />}>Encontrar mercados</Button>
        </div>

        <MobileNav links={NAV_LINKS} />
      </div>
    </header>
  );
}
