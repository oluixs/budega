"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { branchFormSchema, weeklyHours, type BranchFormValues, type Market } from "@budega/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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
import { createBranch } from "@/lib/admin-actions";

interface BranchFormDialogProps {
  markets: Market[];
}

// latitude/longitude começam vazios de propósito: 0,0 passaria na validação e colocaria
// a filial no meio do oceano.
const emptyDefaults = {
  market_id: "",
  name: "",
  address: "",
  neighborhood: "",
  city: "",
  state: "",
  postal_code: "",
  latitude: undefined,
  longitude: undefined,
  phone: null,
  opening_hours: [],
} as unknown as BranchFormValues;

export function BranchFormDialog({ markets }: BranchFormDialogProps) {
  const [open, setOpen] = useState(false);
  // Sem `items`, o Select do Base UI mostra o ID cru no gatilho em vez do nome.
  const marketLabels = Object.fromEntries(markets.map((market) => [market.id, market.name]));
  const [opensAt, setOpensAt] = useState("07:00");
  const [closesAt, setClosesAt] = useState("22:00");
  const [closedOnSunday, setClosedOnSunday] = useState(false);
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: emptyDefaults,
  });

  async function onSubmit(values: BranchFormValues) {
    const result = await createBranch({
      ...values,
      state: values.state.toUpperCase(),
      phone: values.phone || null,
      opening_hours: weeklyHours(opensAt, closesAt, closedOnSunday ? [0] : []),
    });
    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      form.reset(emptyDefaults);
    } else {
      toast.error(result.message);
    }
  }

  const textField = (name: "name" | "address" | "neighborhood" | "city", label: string, placeholder?: string) => (
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

  const coordinateField = (name: "latitude" | "longitude", label: string, placeholder: string) => (
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
              onChange={(event) =>
                field.onChange(event.target.value === "" ? undefined : Number(event.target.value))
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4" /> Nova filial
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastrar filial</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1">
            <FormField
              control={form.control}
              name="market_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mercado</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} items={marketLabels}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {markets.map((market) => (
                          <SelectItem key={market.id} value={market.id}>
                            {market.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {textField("name", "Nome da filial", "Ex.: Bom Preço - Centro")}
            {textField("address", "Endereço", "Rua, número")}

            <div className="grid grid-cols-2 gap-4">
              {textField("neighborhood", "Bairro")}
              {textField("city", "Cidade")}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Telefone (opcional)</FormLabel>
                    <FormControl>
                      <Input type="tel" value={field.value ?? ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {coordinateField("latitude", "Latitude", "-23.5610")}
              {coordinateField("longitude", "Longitude", "-46.6822")}
            </div>

            <fieldset className="grid gap-3 rounded-lg border border-neutral-300 p-3">
              <legend className="px-1 text-body font-medium text-neutral-900">Horário de funcionamento</legend>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="branch-opens-at">Abre às</Label>
                  <Input
                    id="branch-opens-at"
                    type="time"
                    value={opensAt}
                    onChange={(event) => setOpensAt(event.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="branch-closes-at">Fecha às</Label>
                  <Input
                    id="branch-closes-at"
                    type="time"
                    value={closesAt}
                    onChange={(event) => setClosesAt(event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="branch-closed-sunday"
                  checked={closedOnSunday}
                  onCheckedChange={(checked) => setClosedOnSunday(checked === true)}
                />
                <Label htmlFor="branch-closed-sunday">Fechado aos domingos</Label>
              </div>
            </fieldset>

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Salvar filial"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
