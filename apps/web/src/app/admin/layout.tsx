import Link from "next/link";
import { AlertTriangle, FileText, Flag, LayoutDashboard, MapPin, Store, Tag } from "lucide-react";
import { requireAdminAccess } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/admin/mercados", label: "Mercados", icon: Store, adminOnly: false },
  { href: "/admin/filiais", label: "Filiais", icon: MapPin, adminOnly: false },
  { href: "/admin/encartes", label: "Encartes", icon: FileText, adminOnly: false },
  { href: "/admin/ofertas", label: "Ofertas", icon: Tag, adminOnly: false },
  { href: "/admin/denuncias", label: "Denúncias", icon: Flag, adminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Sem sessão → /entrar; sem role de painel → /acesso-negado. As páginas e funções de
  // dados repetem a checagem (lib/admin-data.ts), porque renderizam em paralelo.
  const access = await requireAdminAccess();
  const isMock = access.status === "mock";
  const isAdmin = isMock || access.isAdmin;
  const navItems = NAV_ITEMS.filter((item) => isAdmin || !item.adminOnly);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row">
      <aside className="lg:w-56 lg:shrink-0">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Navegação administrativa">
          {navItems.map((item) => (
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
        {access.status === "granted" && (
          <div className="mt-4 hidden flex-col gap-1 border-t border-neutral-300 pt-4 lg:flex">
            <p className="truncate text-body font-medium text-neutral-900">{access.user.name}</p>
            <p className="text-caption text-neutral-500">
              {access.isAdmin ? "Administrador" : "Responsável por mercado"}
            </p>
            <SignOutButton className="mt-2 justify-start px-0" />
          </div>
        )}
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
