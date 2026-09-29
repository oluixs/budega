import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata: Metadata = { title: "Acesso restrito", robots: { index: false } };

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 text-warning">
        <ShieldAlert className="h-7 w-7" aria-hidden="true" />
      </span>
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Acesso restrito</h1>
        <p className="mt-2 text-body-lg text-neutral-700">
          Sua conta não tem permissão para acessar o painel administrativo. O painel é
          liberado para administradores e responsáveis por mercados cadastrados.
        </p>
        <p className="mt-2 text-body text-neutral-500">
          Se você cuida de um mercado, peça a um administrador do Budega para liberar seu
          acesso.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button render={<Link href="/" />}>Voltar para o início</Button>
        <SignOutButton variant="outline" />
      </div>
    </div>
  );
}
