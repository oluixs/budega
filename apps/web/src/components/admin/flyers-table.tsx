"use client";

import { useMemo, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDateBR, type Flyer, type Market } from "@budega/shared";
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
import { FlyerFormDialog } from "@/components/admin/flyer-form-dialog";
import { setFlyerStatus } from "@/lib/admin-actions";
import { FileText } from "lucide-react";

const STATUS_LABEL: Record<Flyer["status"], string> = {
  active: "Ativo",
  paused: "Pausado",
  archived: "Arquivado",
};

export function FlyersTable({ flyers, markets }: { flyers: Flyer[]; markets: Market[] }) {
  const [isPending, startTransition] = useTransition();
  const marketNameById = useMemo(() => new Map(markets.map((m) => [m.id, m.name])), [markets]);

  function changeStatus(flyer: Flyer, status: "active" | "paused" | "archived") {
    startTransition(async () => {
      const result = await setFlyerStatus(flyer.id, status);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <FlyerFormDialog markets={markets} />
      </div>

      {flyers.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum encarte cadastrado" />
      ) : (
        <div className="rounded-xl border border-neutral-300 bg-neutral-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Mercado</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flyers.map((flyer) => (
                <TableRow key={flyer.id}>
                  <TableCell className="font-medium">
                    <Link href={`/encartes/${flyer.id}`} className="hover:text-brand-600 hover:underline">
                      {flyer.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-neutral-500">{marketNameById.get(flyer.market_id) ?? "—"}</TableCell>
                  <TableCell className="text-neutral-500">
                    {formatDateBR(flyer.valid_from)} – {formatDateBR(flyer.valid_until)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={flyer.status === "active" ? "default" : "secondary"} className={flyer.status === "active" ? "bg-brand-500" : ""}>
                      {STATUS_LABEL[flyer.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {flyer.status !== "active" && (
                        <Button size="sm" variant="outline" disabled={isPending} onClick={() => changeStatus(flyer, "active")}>
                          Ativar
                        </Button>
                      )}
                      {flyer.status !== "paused" && (
                        <Button size="sm" variant="outline" disabled={isPending} onClick={() => changeStatus(flyer, "paused")}>
                          Pausar
                        </Button>
                      )}
                      {flyer.status !== "archived" && (
                        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => changeStatus(flyer, "archived")}>
                          Arquivar
                        </Button>
                      )}
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
