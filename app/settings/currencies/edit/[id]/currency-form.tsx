"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { createCurrency, updateCurrency } from "@/app/actions/currencies"
import { Currency } from "@/lib/types"
import { useEffect } from "react" // Import useEffect

const formSchema = z.object({
  code: z.string().min(2).max(3),
  name: z.string().min(2),
  symbol: z.string().min(1).max(3),
  decimalDigits: z.coerce.number().min(0).max(8),
  isDefault: z.boolean(),
  ratio: z.coerce.number().min(0),
})

interface CurrencyFormProps {
  initialData?: Currency | null
}

export function CurrencyForm({ initialData }: CurrencyFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { // Provide empty defaults, reset will handle initialData
      code: "",
      name: "",
      symbol: "",
      decimalDigits: 2,
      isDefault: false,
      ratio: 1.0,
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code,
        name: initialData.name,
        symbol: initialData.symbol,
        decimalDigits: initialData.decimalDigits,
        isDefault: initialData.isDefault,
        ratio: initialData.ratio,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await updateCurrency(initialData.id, values)
        toast({
          title: "Success",
          description: "Currency updated successfully",
        })
      } else {
        await createCurrency(values)
        toast({
          title: "Success",
          description: "Currency created successfully",
        })
      }
      router.push("/settings/currencies")
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${initialData ? "update" : "create"} currency`,
        variant: "destructive",
      })
    }
  }

  const title = initialData ? "Edit Currency" : "Create New Currency"
  const description = initialData ? "Edit an existing currency" : "Add a new currency to use in transactions"
  const action = initialData ? "Save Changes" : "Create Currency"

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency Code</FormLabel>
                <FormControl>
                  <Input placeholder="USD, EUR, etc." {...field} />
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
                <FormLabel>Currency Name</FormLabel>
                <FormControl>
                  <Input placeholder="US Dollar, Euro, etc." {...field} />
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
                  <Input placeholder="$" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="decimalDigits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Decimal Digits</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="8"
                    {...field}
                  />
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
                <FormLabel>Exchange Rate Ratio</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.00000001"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">{action}</Button>
        </form>
      </Form>
    </div>
  )
}
