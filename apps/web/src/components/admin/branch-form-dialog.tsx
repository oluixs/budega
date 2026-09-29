"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { branchFormSchema, weeklyHours, type Branch, type BranchFormValues, type Market } from "@budega/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { OpeningHoursEditor, openingHoursError } from "@/components/admin/opening-hours-editor";
import { createBranch, updateBranch } from "@/lib/admin-actions";

interface BranchFormDialogProps {
  markets: Market[];
  /** Sem `branch`: cadastro. Com `branch`: edição. */
  branch?: Branch;
}

// latitude/longitude começam vazios de propósito: 0,0 passaria na validação e colocaria
// a filial no meio do oceano.
function defaultsFor(branch?: Branch): BranchFormValues {
  if (!branch) {
    return {
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
      opening_hours: weeklyHours("07:00", "22:00"),
    } as unknown as BranchFormValues;
  }
  return {
    market_id: branch.market_id,
    name: branch.name,
    address: branch.address,
    neighborhood: branch.neighborhood,
    city: branch.city,
    state: branch.state,
    postal_code: branch.postal_code,
    latitude: branch.latitude,
    longitude: branch.longitude,
    phone: branch.phone,
    opening_hours: branch.opening_hours.length ? branch.opening_hours : weeklyHours("07:00", "22:00"),
  };
}

export function BranchFormDialog({ markets, branch }: BranchFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(branch);
  // Sem `items`, o Select do Base UI mostra o ID cru no gatilho em vez do nome.
  const marketLabels = Object.fromEntries(markets.map((market) => [market.id, market.name]));
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: defaultsFor(branch),
  });

  async function onSubmit(values: BranchFormValues) {
    const payload = { ...values, state: values.state.toUpperCase() };
    const result = branch ? await updateBranch(branch.id, payload) : await createBranch(payload);
    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      form.reset(branch ? payload : defaultsFor());
    } else {
      toast.error(result.message);
    }
  }

  const textField = (
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
      {isEdit ? (
        <DialogTrigger render={<Button size="sm" variant="outline" aria-label={`Editar ${branch!.name}`} />}>
          <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Nova filial
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar ${branch!.name}` : "Cadastrar filial"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1">
            <FormField
              control={form.control}
              name="market_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mercado</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} items={marketLabels}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {markets.map((market) => (
                        <SelectItem key={market.id} value={market.id}>
                          {market.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {textField("name", "Nome da filial", "Ex.: Bom Preço - Centro")}
            {textField("address", "Endereço", "Rua, número")}

            <div className="grid gap-4 sm:grid-cols-2">
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
              {textField("postal_code", "CEP", "00000-000")}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Telefone (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value || null)}
                      />
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

            <FormField
              control={form.control}
              name="opening_hours"
              render={({ field }) => (
                <OpeningHoursEditor
                  idPrefix={branch ? `branch-${branch.id}` : "branch-new"}
                  value={field.value}
                  onChange={field.onChange}
                  error={openingHoursError(form.formState.errors)}
                />
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Salvar filial"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
