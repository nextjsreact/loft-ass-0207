'use client'

import { TransactionForm } from '@/components/forms/transaction-form'
import { getTransaction, updateTransaction } from '@/app/actions/transactions'
import { getCategories } from '@/app/actions/categories'
import { Transaction as TransactionFormData } from '@/lib/validations' // Corrected import
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Currency, Transaction } from '@/lib/types' // Corrected import
import { getLofts } from '@/app/actions/lofts' // Import getLofts
interface Category {
  id: string;
  name: string;
  type: string;
}

interface Loft {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function EditTransactionPage() {
  const params = useParams()
  const id = params.id as string
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [lofts, setLofts] = useState<Loft[]>([]) // Add lofts state
  const [currencies, setCurrencies] = useState<Currency[]>([]) // Add currencies state
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [transactionData, categoriesData, loftsData, currenciesData] = await Promise.all([
          getTransaction(id),
          getCategories(),
          getLofts(),
          fetch('/api/currencies').then(res => res.json())
        ])
        setTransaction(transactionData)
        setCategories(categoriesData)
        setLofts(loftsData)
        setCurrencies(currenciesData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [id])

  const handleUpdateTransaction = async (data: TransactionFormData) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      await updateTransaction(id, data)
    } catch (error) {
      console.error(error)
      // Handle error state in the form
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!transaction) return <div>Loading...</div>

  return <TransactionForm transaction={transaction} categories={categories} lofts={lofts} currencies={currencies} onSubmit={handleUpdateTransaction} isSubmitting={isSubmitting} />
}
