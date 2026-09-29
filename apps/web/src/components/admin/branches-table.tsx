"use client";

import { useMemo, useState, useTransition } from "react";
import { SearchX, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatOpeningHoursToday, type Branch, type Market } from "@budega/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { BranchFormDialog } from "@/components/admin/branch-form-dialog";
import { deleteBranch } from "@/lib/admin-actions";

const ALL_MARKETS = "all";

interface BranchesTableProps {
  branches: Branch[];
  markets: Market[];
}

export function BranchesTable({ branches, markets }: BranchesTableProps) {
  const [query, setQuery] = useState("");
  const [marketFilter, setMarketFilter] = useState<string>(ALL_MARKETS);
  const marketNameById = useMemo(() => new Map(markets.map((m) => [m.id, m.name])), [markets]);

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return branches.filter((branch) => {
      if (marketFilter !== ALL_MARKETS && branch.market_id !== marketFilter) return false;
      if (!lower) return true;
      return [branch.name, branch.neighborhood, branch.city].join(" ").toLowerCase().includes(lower);
    });
  }, [branches, query, marketFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, bairro ou cidade"
            aria-label="Buscar filial"
            className="max-w-sm"
          />
          <Select
            value={marketFilter}
            onValueChange={(value) => setMarketFilter(value ?? ALL_MARKETS)}
            items={{ [ALL_MARKETS]: "Todos os mercados", ...Object.fromEntries(marketNameById) }}
          >
            <SelectTrigger className="w-56" aria-label="Filtrar por mercado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_MARKETS}>Todos os mercados</SelectItem>
              {markets.map((market) => (
                <SelectItem key={market.id} value={market.id}>
                  {market.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <BranchFormDialog markets={markets} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={SearchX} title="Nenhuma filial encontrada" />
      ) : (
        <div className="rounded-xl border border-neutral-300 bg-neutral-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filial</TableHead>
                <TableHead>Mercado</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Horário hoje</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell className="text-neutral-500">{marketNameById.get(branch.market_id) ?? "—"}</TableCell>
                  <TableCell className="text-neutral-500">
                    {branch.address} — {branch.neighborhood}, {branch.city}/{branch.state}
                  </TableCell>
                  <TableCell className="text-neutral-500">{formatOpeningHoursToday(branch.opening_hours)}</TableCell>
                  <TableCell>
                    <DeleteBranchButton branch={branch} />
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

function DeleteBranchButton({ branch }: { branch: Branch }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteBranch(branch.id);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" aria-label={`Excluir ${branch.name}`} />}>
        <Trash2 className="h-4 w-4" aria-hidden="true" /> Excluir
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir “{branch.name}”?</DialogTitle>
          <DialogDescription>
            Ofertas e encartes vinculados a esta filial não serão apagados — passam a valer
            para o mercado inteiro. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button variant="destructive" disabled={isPending} onClick={confirmDelete}>
            {isPending ? "Excluindo..." : "Excluir filial"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
