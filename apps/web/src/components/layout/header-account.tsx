"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useSessionUser } from "@/hooks/use-session-user";

interface HeaderAccountProps {
  /** Layout vertical do menu mobile; chamado ao navegar para fechar o menu. */
  onNavigate?: () => void;
  stacked?: boolean;
}

/** "Entrar" para visitantes; "Painel" (se tiver role) e "Sair" para quem está logado. */
export function HeaderAccount({ onNavigate, stacked = false }: HeaderAccountProps) {
  const user = useSessionUser();
  const variant = stacked ? "outline" : "ghost";

  if (!user) {
    return (
      <Button variant={variant} onClick={onNavigate} render={<Link href="/entrar" />}>
        Entrar
      </Button>
    );
  }

  const canUsePanel = user.role === "admin" || user.role === "market_manager";

  return (
    <>
      {canUsePanel && (
        <Button variant={variant} onClick={onNavigate} render={<Link href="/admin" />}>
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Painel
        </Button>
      )}
      <SignOutButton variant={variant} onSignedOut={onNavigate} />
    </>
  );
}
