import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Entrar" };

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Entrar</h1>
        <p className="mt-2 text-body text-neutral-500">
          Entrar é opcional — você só precisa disso para sincronizar favoritos entre
          aparelhos. Consultar mercados e ofertas nunca exige cadastro.
        </p>
      </div>
      <AuthForm mode="sign-in" />
      <p className="text-center text-body text-neutral-500">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-brand-600 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
