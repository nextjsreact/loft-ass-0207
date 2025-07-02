"use server"

import { sql } from "@/lib/database"
import { revalidatePath } from "next/cache"
import { Currency } from "@/lib/types"

export async function getCurrencies(): Promise<Currency[]> {
  if (!sql) {
    throw new Error("Database not initialized")
  }
  const currencies = await sql`SELECT * FROM currencies`
  return currencies.map((currency: any) => ({ // Explicitly type as any to allow property access
    id: currency.id,
    code: currency.code,
    name: currency.name,
    symbol: currency.symbol,
    isDefault: Boolean(currency.is_default), // Map to camelCase and boolean
    ratio: currency.ratio,
    created_at: currency.created_at,
    updated_at: currency.updated_at,
  })) as Currency[]
}

export async function setDefaultCurrency(id: string) {
  if (!sql) {
    throw new Error("Database not initialized")
  }
  await sql`UPDATE currencies SET is_default = FALSE`
  await sql`
    UPDATE currencies
    SET is_default = TRUE
    WHERE id = ${id}
  `
  revalidatePath("/settings/currencies")
}

export async function createCurrency(data: any) {
  if (!sql) {
    throw new Error("Database not initialized")
  }
  const currency = await sql`
    INSERT INTO currencies (
      code, name, symbol, is_default, ratio
    ) VALUES (
      ${data.code}, 
      ${data.name}, 
      ${data.symbol}, 
      ${data.isDefault || false},
      ${data.ratio || 1.0}
    )
    RETURNING *
  `
  revalidatePath("/settings/currencies")
  return currency
}

export async function updateCurrency(id: string, data: any) {
  if (!sql) {
    throw new Error("Database not initialized")
  }
  const currency = await sql`
    UPDATE currencies
    SET 
      code = ${data.code}, 
      name = ${data.name}, 
      symbol = ${data.symbol}, 
      is_default = ${data.isDefault},
      ratio = ${data.ratio},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  revalidatePath("/settings/currencies")
  return currency
}

export async function deleteCurrency(id: string) {
  if (!sql) {
    throw new Error("Database not initialized")
  }
  await sql`DELETE FROM currencies WHERE id = ${id}`
  revalidatePath("/settings/currencies")
}
