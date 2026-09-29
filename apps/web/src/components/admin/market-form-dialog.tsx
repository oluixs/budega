"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { marketFormSchema, weeklyHours, type Market, type MarketFormValues } from "@budega/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { OpeningHoursEditor, openingHoursError } from "@/components/admin/opening-hours-editor";
import { createMarket, updateMarket } from "@/lib/admin-actions";

interface MarketFormDialogProps {
  /** Sem `market`: cadastro. Com `market`: edição. */
  market?: Market;
}

// latitude/longitude começam vazios de propósito: 0,0 passaria na validação e colocaria
// o mercado no meio do oceano.
function defaultsFor(market?: Market): MarketFormValues {
  if (!market) {
    return {
      name: "",
      description: null,
      logo_url: null,
      phone: null,
      whatsapp: null,
      address: "",
      neighborhood: "",
      city: "",
      state: "",
      postal_code: "",
      latitude: undefined,
      longitude: undefined,
      opening_hours: weeklyHours("07:00", "22:00"),
    } as unknown as MarketFormValues;
  }
  return {
    name: market.name,
    description: market.description,
    logo_url: market.logo_url,
    phone: market.phone,
    whatsapp: market.whatsapp,
    address: market.address,
    neighborhood: market.neighborhood,
    city: market.city,
    state: market.state,
    postal_code: market.postal_code,
    latitude: market.latitude,
    longitude: market.longitude,
    opening_hours: market.opening_hours.length ? market.opening_hours : weeklyHours("07:00", "22:00"),
  };
}

export function MarketFormDialog({ market }: MarketFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(market);
  const form = useForm<MarketFormValues>({
    resolver: zodResolver(marketFormSchema),
    defaultValues: defaultsFor(market),
  });

  async function onSubmit(values: MarketFormValues) {
    const payload = { ...values, state: values.state.toUpperCase() };
    const result = market ? await updateMarket(market.id, payload) : await createMarket(payload);
    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      form.reset(market ? payload : defaultsFor());
    } else {
      toast.error(result.message);
    }
  }

  const text = (
    name: "name" | "address" | "neighborhood" | "city" | "postal_code",
    label: string,
    placeholder?: string,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Campos opcionais: vazio vira null (string vazia reprovaria .url()/.min()).
  const optional = (name: "phone" | "whatsapp" | "logo_url", label: string, type: string, placeholder?: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={(event) => field.onChange(event.target.value || null)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const coordinate = (name: "latitude" | "longitude", label: string, placeholder: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              step="any"
              inputMode="decimal"
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={(event) => field.onChange(event.target.value === "" ? undefined : Number(event.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <DialogTrigger render={<Button size="sm" variant="outline" aria-label={`Editar ${market!.name}`} />}>
          <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Novo mercado
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar ${market!.name}` : "Cadastrar mercado"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "O endereço da página do mercado não muda ao editar o nome."
              : "O mercado aparece no Budega assim que for salvo. A verificação é feita por um administrador."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1">
            {text("name", "Nome do mercado", "Ex.: Mercadinho Bom Preço")}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="O que o cliente encontra aqui"
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {optional("phone", "Telefone (opcional)", "tel", "(11) 3000-0000")}
              {optional("whatsapp", "WhatsApp (opcional)", "tel", "(11) 90000-0000")}
            </div>
            {optional("logo_url", "URL do logo (opcional)", "url", "https://...")}

            {text("address", "Endereço", "Rua, número")}
            <div className="grid gap-4 sm:grid-cols-2">
              {text("neighborhood", "Bairro")}
              {text("city", "Cidade")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input maxLength={2} placeholder="SP" className="uppercase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {text("postal_code", "CEP", "00000-000")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {coordinate("latitude", "Latitude", "-23.5610")}
              {coordinate("longitude", "Longitude", "-46.6822")}
            </div>

            <FormField
              control={form.control}
              name="opening_hours"
              render={({ field }) => (
                <OpeningHoursEditor
                  idPrefix={market ? `market-${market.id}` : "market-new"}
                  value={field.value}
                  onChange={field.onChange}
                  error={openingHoursError(form.formState.errors)}
                />
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar mercado"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
