import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Cadastro" };

export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Criar conta</h1>
        <p className="mt-2 text-body text-neutral-500">
          Opcional — crie uma conta para sincronizar favoritos e preferências entre
          aparelhos.
        </p>
      </div>
      <AuthForm mode="sign-up" />
      <p className="text-center text-body text-neutral-500">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-medium text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
