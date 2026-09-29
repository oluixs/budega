"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getBrowserSupabase } from "@/lib/supabase";

interface SignOutButtonProps {
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
  onSignedOut?: () => void;
}

export function SignOutButton({ variant = "ghost", className, onSignedOut }: SignOutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const supabase = getBrowserSupabase();
  if (!supabase) return null;

  async function signOut() {
    setPending(true);
    const { error } = await supabase!.auth.signOut();
    setPending(false);
    if (error) {
      toast.error("Não foi possível sair. Tente novamente.");
      return;
    }
    onSignedOut?.();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant={variant} className={className} disabled={pending} onClick={signOut}>
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {pending ? "Saindo..." : "Sair"}
    </Button>
  );
}
