"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { reportFormSchema, type ReportFormValues, type ReportReason } from "@budega/shared";
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
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} items={REASON_LABELS}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(REASON_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
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
                {form.formState.isSubmitting ? "Enviando..." : "Enviar denúncia"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
