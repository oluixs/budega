"use client";

import { useMemo, useState, useTransition } from "react";
import { SearchX, X } from "lucide-react";
import { toast } from "sonner";
import { formatDateBR, type AdminUser, type Market, type UserRole } from "@budega/shared";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { assignMarketOwner, setUserRole } from "@/lib/admin-actions";
import type { ActionResult } from "@/lib/actions";

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "Cliente",
  market_manager: "Responsável por mercado",
  admin: "Administrador",
};

interface UsersTableProps {
  users: AdminUser[];
  markets: Market[];
  /** Linha do próprio admin fica travada (ninguém muda a própria permissão). */
  currentUserId: string | null;
}

export function UsersTable({ users, markets, currentUserId }: UsersTableProps) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    if (!lower) return users;
    return users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(lower));
  }, [users, query]);

  function run(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      const result = await action();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  const marketLabels = Object.fromEntries(markets.map((market) => [market.id, market.name]));

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por nome ou e-mail"
        aria-label="Buscar usuário"
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState icon={SearchX} title="Nenhum usuário encontrado" />
      ) : (
        <div className="rounded-xl border border-neutral-300 bg-neutral-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Permissão</TableHead>
                <TableHead>Mercados sob responsabilidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const isSelf = user.id === currentUserId;
                const owned = markets.filter((market) => market.owner_id === user.id);
                const assignable = markets.filter((market) => market.owner_id !== user.id);
                const canOwn = user.role !== "user";

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium text-neutral-900">{user.name}</p>
                      <p className="text-body text-neutral-500">{user.email}</p>
                      <p className="text-caption text-neutral-500">Desde {formatDateBR(user.created_at)}</p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        items={ROLE_LABELS}
                        disabled={isSelf || isPending}
                        onValueChange={(role) => role && run(() => setUserRole(user.id, role as UserRole))}
                      >
                        <SelectTrigger className="w-56" aria-label={`Permissão de ${user.name}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                            <SelectItem key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isSelf && <p className="mt-1 text-caption text-neutral-500">Esta é a sua conta.</p>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {owned.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {owned.map((market) => (
                              <Badge key={market.id} variant="secondary" className="gap-1">
                                {market.name}
                                <button
                                  type="button"
                                  className="rounded-sm hover:text-danger focus-visible:outline-2 focus-visible:outline-brand-500"
                                  aria-label={`Remover ${user.name} de ${market.name}`}
                                  disabled={isPending}
                                  onClick={() => run(() => assignMarketOwner(market.id, null))}
                                >
                                  <X className="h-3 w-3" aria-hidden="true" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        {canOwn ? (
                          <Select
                            value={null}
                            items={marketLabels}
                            disabled={isPending || assignable.length === 0}
                            onValueChange={(marketId) => marketId && run(() => assignMarketOwner(marketId as string, user.id))}
                          >
                            <SelectTrigger className="w-56" aria-label={`Atribuir mercado a ${user.name}`}>
                              <SelectValue placeholder="Atribuir mercado..." />
                            </SelectTrigger>
                            <SelectContent>
                              {assignable.map((market) => (
                                <SelectItem key={market.id} value={market.id}>
                                  {market.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-body text-neutral-500">
                            Mude a permissão para “Responsável por mercado” para atribuir mercados.
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
