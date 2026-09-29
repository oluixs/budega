"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  authSchema,
  signUpSchema,
  type AuthValues,
  type SignUpValues,
} from "@budega/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { isMock, supabase } from "@/lib/supabase";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const schema = mode === "sign-up" ? signUpSchema : authSchema;

  const form = useForm<SignUpValues | AuthValues>({
    resolver: zodResolver(schema),
    defaultValues: mode === "sign-up" ? { name: "", email: "", password: "" } : { email: "", password: "" },
  });

  async function onSubmit(values: SignUpValues | AuthValues) {
    if (isMock) {
      toast.info("Modo demonstração", {
        description:
          "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para habilitar autenticação real. Por enquanto, você pode continuar usando o Budega sem conta.",
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === "sign-up") {
        const { name, email, password } = values as SignUpValues;
        const { error } = await supabase!.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      } else {
        const { email, password } = values as AuthValues;
        const { error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso.");
        router.push("/");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {mode === "sign-up" && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="voce@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-2" disabled={loading}>
          {loading ? "Enviando..." : mode === "sign-up" ? "Criar conta" : "Entrar"}
        </Button>
      </form>
    </Form>
  );
}
