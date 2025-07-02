"use server"

import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { redirect } from "next/navigation"
import { transactionSchema } from "@/lib/validations"
import { Transaction } from "@/lib/types"
import { getCurrencies } from "@/app/actions/currencies"

export async function getTransactions(): Promise<(Transaction & { currency_symbol?: string })[]> {
  await ensureSchema()
  if (!sql) {
    return []
  }
  const transactions = await sql`
    SELECT 
      t.*, 
      TO_CHAR(t.date, 'YYYY-MM-DD') AS formatted_date,
      c.symbol as currency_symbol,
      t.ratio_at_transaction,
      t.equivalent_amount_default_currency
    FROM transactions t
    LEFT JOIN currencies c ON t.currency_id = c.id
    ORDER BY formatted_date DESC
  `
  return transactions.map((t: any) => ({ ...t, date: t.formatted_date })) as (Transaction & { currency_symbol?: string })[]
}

export async function getTransaction(id: string): Promise<(Transaction & { currency_symbol?: string }) | null> {
  await ensureSchema()
  if (!sql) {
    return null
  }
  try {
    const result = await sql`
      SELECT 
        t.*, 
        TO_CHAR(t.date, 'YYYY-MM-DD') AS formatted_date,
        c.symbol as currency_symbol,
        t.ratio_at_transaction,
        t.equivalent_amount_default_currency
      FROM transactions t
      LEFT JOIN currencies c ON t.currency_id = c.id
      WHERE t.id = ${id}
    `
    const transaction = result[0] as any
    if (transaction) {
      transaction.date = transaction.formatted_date
      delete transaction.formatted_date
    }
    return transaction as (Transaction & { currency_symbol?: string }) || null
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return null
  }
}

export async function createTransaction(data: unknown) {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  const validatedData = transactionSchema.parse(data)

  if (!sql) {
    throw new Error("Database not initialized")
  }

  let ratioAtTransaction = null;
  let equivalentAmountDefaultCurrency = null;

  if (validatedData.currency_id && validatedData.amount) {
    const currencies = await getCurrencies();
    const selectedCurrency = currencies.find(c => c.id === validatedData.currency_id);
    const defaultCurrency = currencies.find(c => c.isDefault);

    if (selectedCurrency && defaultCurrency) {
      ratioAtTransaction = (selectedCurrency.ratio || 1) / (defaultCurrency.ratio || 1);
      equivalentAmountDefaultCurrency = validatedData.amount * ratioAtTransaction;
    }
  }

  try {
    const result = await sql`
      INSERT INTO transactions (
        amount,
        transaction_type,
        status,
        description,
        date,
        category,
        currency_id,
        loft_id,
        ratio_at_transaction,
        equivalent_amount_default_currency
      ) VALUES (
        ${validatedData.amount},
        ${validatedData.transaction_type},
        ${validatedData.status},
        ${validatedData.description},
        ${validatedData.date},
        ${validatedData.category},
        ${validatedData.currency_id || null},
        ${validatedData.loft_id || null},
        ${ratioAtTransaction},
        ${equivalentAmountDefaultCurrency}
      )
      RETURNING id
    `

    if (!result || !result[0]?.id) {
      throw new Error("Failed to create transaction")
    }

    console.log("Successfully created transaction with ID:", result[0].id)
    redirect("/transactions")
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Error creating transaction:", error)
    throw error
  }
}

export async function updateTransaction(id: string, data: unknown) {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  const validatedData = transactionSchema.parse(data)

  if (!sql) {
    throw new Error("Database not initialized")
  }

  let ratioAtTransaction = null;
  let equivalentAmountDefaultCurrency = null;

  if (validatedData.currency_id && validatedData.amount) {
    const currencies = await getCurrencies();
    const selectedCurrency = currencies.find(c => c.id === validatedData.currency_id);
    const defaultCurrency = currencies.find(c => c.isDefault);

    if (selectedCurrency && defaultCurrency) {
      ratioAtTransaction = (selectedCurrency.ratio || 1) / (defaultCurrency.ratio || 1);
      equivalentAmountDefaultCurrency = validatedData.amount * ratioAtTransaction;
    }
  }

  try {
    const result = await sql`
      UPDATE transactions SET
        amount = ${validatedData.amount},
        transaction_type = ${validatedData.transaction_type},
        status = ${validatedData.status},
        description = ${validatedData.description},
        date = ${validatedData.date},
        category = ${validatedData.category},
        currency_id = ${validatedData.currency_id || null},
        loft_id = ${validatedData.loft_id || null},
        ratio_at_transaction = ${ratioAtTransaction},
        equivalent_amount_default_currency = ${equivalentAmountDefaultCurrency},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `

    if (!result || !result[0]?.id) {
      throw new Error("Failed to update transaction")
    }

    redirect(`/transactions/${id}`)
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Error updating transaction:", error)
    throw error
  }
}

export async function deleteTransaction(id: string) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  if (!sql) {
    throw new Error("Database not initialized")
  }

  try {
    await sql`DELETE FROM transactions WHERE id = ${id}`
    redirect("/transactions")
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Error deleting transaction:", error)
    throw error
  }
}
