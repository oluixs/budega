"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { buildIssueUrl, reportFormSchema, type ReportFormValues, type ReportReason } from "@budega/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitReport } from "@/lib/actions";
import { isCatalogMode } from "@/lib/env";

const REASON_LABELS: Record<ReportReason, string> = {
  preco_incorreto: "Preço incorreto",
  oferta_vencida: "Oferta vencida",
  mercado_incorreto: "Informações do mercado incorretas",
  conteudo_inadequado: "Conteúdo inadequado",
  encarte_ilegivel: "Encarte ilegível",
};

interface ReportDialogProps {
  marketId?: string;
  offerId?: string;
  flyerId?: string;
  defaultReason?: ReportReason;
}

export function ReportDialog({ marketId, offerId, flyerId, defaultReason }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      market_id: marketId ?? null,
      offer_id: offerId ?? null,
      flyer_id: flyerId ?? null,
      reason: defaultReason ?? "preco_incorreto",
      description: "",
    },
  });

  async function onSubmit(values: ReportFormValues) {
    if (isCatalogMode) {
      // Sem backend não há onde guardar a denúncia: abre um aviso preenchido no GitHub
      // do projeto (público). Nada é enviado ao Budega.
      const details = values.description?.trim();
      window.open(
        buildIssueUrl({
          title: `Correção: ${REASON_LABELS[values.reason]}`,
          body: [`Página: ${window.location.href}`, "", details || "(descreva o que está errado)"].join("\n"),
        }),
        "_blank",
        "noopener",
      );
      setOpen(false);
      form.reset();
      return;
    }
    const result = await submitReport(values);
    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      form.reset();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Flag className="h-4 w-4" /> Denunciar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Denunciar conteúdo</DialogTitle>
          <DialogDescription>
            Nos ajude a manter as informações do Budega confiáveis e atualizadas.
            {isCatalogMode &&
              " O aviso é aberto no GitHub do projeto, que é público: não escreva dados pessoais."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} items={REASON_LABELS}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(REASON_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalhes (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Conte o que encontrou de errado" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {isCatalogMode ? "Continuar no GitHub" : form.formState.isSubmitting ? "Enviando..." : "Enviar denúncia"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
