"use client";

import { useMemo, useTransition } from "react";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import type { Market, Report, ReportReason } from "@budega/shared";
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
import { resolveReport } from "@/lib/admin-actions";

const REASON_LABEL: Record<ReportReason, string> = {
  preco_incorreto: "Preço incorreto",
  oferta_vencida: "Oferta vencida",
  mercado_incorreto: "Mercado incorreto",
  conteudo_inadequado: "Conteúdo inadequado",
  encarte_ilegivel: "Encarte ilegível",
};

const STATUS_LABEL: Record<Report["status"], string> = {
  pending: "Pendente",
  reviewing: "Em análise",
  resolved: "Resolvida",
  dismissed: "Descartada",
};

export function ReportsTable({ reports, markets }: { reports: Report[]; markets: Market[] }) {
  const [isPending, startTransition] = useTransition();
  const marketNameById = useMemo(() => new Map(markets.map((m) => [m.id, m.name])), [markets]);

  function resolve(report: Report, status: "resolved" | "dismissed") {
    startTransition(async () => {
      const result = await resolveReport(report.id, status);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  if (reports.length === 0) {
    return <EmptyState icon={Flag} title="Nenhuma denúncia registrada" description="Ótimo sinal — nada para revisar agora." />;
  }

  return (
    <div className="rounded-xl border border-neutral-300 bg-neutral-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Motivo</TableHead>
            <TableHead>Mercado</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{REASON_LABEL[report.reason]}</TableCell>
              <TableCell className="text-neutral-500">
                {report.market_id ? marketNameById.get(report.market_id) ?? "—" : "—"}
              </TableCell>
              <TableCell className="max-w-xs truncate text-neutral-500">{report.description ?? "—"}</TableCell>
              <TableCell>
                <Badge
                  variant={report.status === "pending" ? "outline" : report.status === "resolved" ? "default" : "secondary"}
                  className={report.status === "resolved" ? "bg-brand-500" : ""}
                >
                  {STATUS_LABEL[report.status]}
                </Badge>
              </TableCell>
              <TableCell>
                {report.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" disabled={isPending} onClick={() => resolve(report, "resolved")}>
                      Resolver
                    </Button>
                    <Button size="sm" variant="ghost" disabled={isPending} onClick={() => resolve(report, "dismissed")}>
                      Descartar
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
