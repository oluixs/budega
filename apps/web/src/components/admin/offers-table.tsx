"use client";

import { useMemo, useState, useTransition } from "react";
import { Copy, SearchX } from "lucide-react";
import { toast } from "sonner";
import { formatDateBR, formatPriceBRL, type Category, type Market, type Offer } from "@budega/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { OfferFormDialog } from "@/components/admin/offer-form-dialog";
import { setOfferFlag } from "@/lib/admin-actions";

interface OffersTableProps {
  offers: Offer[];
  markets: Market[];
  categories: Category[];
}

export function OffersTable({ offers, markets, categories }: OffersTableProps) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const marketNameById = useMemo(() => new Map(markets.map((m) => [m.id, m.name])), [markets]);

  const filtered = useMemo(() => {
    if (!query.trim()) return offers;
    const lower = query.toLowerCase();
    return offers.filter((offer) => offer.name.toLowerCase().includes(lower));
  }, [offers, query]);

  function toggle(offer: Offer, flag: "is_active" | "is_featured") {
    startTransition(async () => {
      const result = await setOfferFlag(offer.id, flag, !offer[flag]);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar oferta por nome"
          className="max-w-sm"
        />
        <OfferFormDialog markets={markets} categories={categories} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={SearchX} title="Nenhuma oferta encontrada" />
      ) : (
        <div className="rounded-xl border border-neutral-300 bg-neutral-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Mercado</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.name}</TableCell>
                  <TableCell className="text-neutral-500">{marketNameById.get(offer.market_id) ?? "—"}</TableCell>
                  <TableCell>{formatPriceBRL(offer.promotional_price)}</TableCell>
                  <TableCell className="text-neutral-500">{formatDateBR(offer.valid_until)}</TableCell>
                  <TableCell className="flex flex-wrap gap-1">
                    <Badge variant={offer.is_active ? "default" : "secondary"} className={offer.is_active ? "bg-brand-500" : ""}>
                      {offer.is_active ? "Ativa" : "Pausada"}
                    </Badge>
                    {offer.is_featured && <Badge className="bg-accent-500 text-neutral-0">Destaque</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" disabled={isPending} onClick={() => toggle(offer, "is_active")}>
                        {offer.is_active ? "Pausar" : "Ativar"}
                      </Button>
                      <Button size="sm" variant="outline" disabled={isPending} onClick={() => toggle(offer, "is_featured")}>
                        {offer.is_featured ? "Remover destaque" : "Destacar"}
                      </Button>
                      <OfferFormDialog
                        markets={markets}
                        categories={categories}
                        initialValues={{
                          market_id: offer.market_id,
                          branch_id: offer.branch_id,
                          category_id: offer.category_id,
                          name: `${offer.name} (cópia)`,
                          description: offer.description ?? "",
                          promotional_price: offer.promotional_price,
                          regular_price: offer.regular_price ?? undefined,
                          unit: offer.unit,
                          conditions: offer.conditions ?? "",
                          valid_from: offer.valid_from.slice(0, 10),
                          valid_until: offer.valid_until.slice(0, 10),
                          is_featured: offer.is_featured,
                        }}
                        trigger={<Copy className="h-4 w-4" />}
                      />
                    </div>
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
