import Link from "next/link";
import { AlertTriangle, FileText, Flag, LayoutDashboard, Store, Tag } from "lucide-react";
import { isMock } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/mercados", label: "Mercados", icon: Store },
  { href: "/admin/encartes", label: "Encartes", icon: FileText },
  { href: "/admin/ofertas", label: "Ofertas", icon: Tag },
  { href: "/admin/denuncias", label: "Denúncias", icon: Flag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row">
      <aside className="lg:w-56 lg:shrink-0">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Navegação administrativa">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-body font-medium text-neutral-700 hover:bg-brand-50 hover:text-brand-700"
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        {isMock && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-body text-neutral-700">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <p>
              Modo demonstração: este painel não está protegido por autenticação real
              nem persiste alterações. Configure o Supabase (ver{" "}
              <code className="rounded bg-neutral-100 px-1">.env.example</code>) para
              habilitar login com role de administrador e gravação real.
            </p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
