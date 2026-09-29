"use client";

import { useMemo, useState } from "react";
import type { Market } from "@budega/shared";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MarketRowActions } from "@/components/admin/market-row-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchX } from "lucide-react";

export function MarketsTable({ markets }: { markets: Market[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return markets;
    const lower = query.toLowerCase();
    return markets.filter((market) =>
      [market.name, market.neighborhood, market.city].join(" ").toLowerCase().includes(lower),
    );
  }, [markets, query]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por nome, bairro ou cidade"
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState icon={SearchX} title="Nenhum mercado encontrado" />
      ) : (
        <div className="rounded-xl border border-neutral-300 bg-neutral-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mercado</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((market) => (
                <TableRow key={market.id}>
                  <TableCell className="font-medium">{market.name}</TableCell>
                  <TableCell className="text-neutral-500">
                    {market.neighborhood}, {market.city}
                  </TableCell>
                  <TableCell>
                    {market.is_suspended ? (
                      <Badge variant="destructive">Suspenso</Badge>
                    ) : (
                      <Badge className="bg-brand-500">Ativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <MarketRowActions market={market} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
