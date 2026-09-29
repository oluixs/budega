import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Entrar" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { next } = await searchParams;
  const destination = safeNextPath(typeof next === "string" ? next : undefined);
  const isPanel = destination.startsWith("/admin");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Entrar</h1>
        <p className="mt-2 text-body text-neutral-500">
          {isPanel
            ? "Entre com uma conta de administrador ou de responsável por mercado para acessar o painel."
            : "Entrar é opcional — você só precisa disso para sincronizar favoritos entre aparelhos. Consultar mercados e ofertas nunca exige cadastro."}
        </p>
      </div>
      <AuthForm mode="sign-in" next={destination} />
      <p className="text-center text-body text-neutral-500">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-brand-600 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
