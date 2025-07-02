"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Currency } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const currencySchema = z.object({
  code: z.string().min(3).max(3),
  name: z.string().min(2),
  symbol: z.string().min(1).max(3),
  isDefault: z.boolean().optional(),
  ratio: z.coerce.number().min(0).nullable().optional(), // Add ratio field, allow null/optional
})

type CurrencyFormValues = z.infer<typeof currencySchema>

interface CurrencyFormProps {
  currency?: Currency
  createCurrency: (data: CurrencyFormValues) => Promise<any>
  updateCurrency: (id: string, data: CurrencyFormValues) => Promise<any>
}

export function CurrencyForm({
  currency,
  createCurrency,
  updateCurrency,
}: CurrencyFormProps) {
  const router = useRouter()
  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      code: currency?.code || "",
      name: currency?.name || "",
      symbol: currency?.symbol || "",
      isDefault: currency?.isDefault || false,
      ratio: currency?.ratio || null, // Pre-fill ratio, default to null
    },
  })

  const onSubmit = async (data: CurrencyFormValues) => {
    try {
      if (currency) {
        await updateCurrency(currency.id, data)
        toast.success("Currency updated")
      } else {
        await createCurrency(data)
        toast.success("Currency created")
      }
      router.push("/settings/currencies")
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ratio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ratio</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.00000001"
                  {...field}
                  value={field.value === null ? "" : field.value} // Convert null to empty string for input
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? null : Number(value)); // Convert empty string back to null
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving..."
            : currency
            ? "Save Changes"
            : "Create Currency"}
        </Button>
      </form>
    </Form>
  )
}
