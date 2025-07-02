'use client'

import { TransactionForm } from '@/components/forms/transaction-form'
import { createTransaction } from '@/app/actions/transactions'
import { getCategories } from '@/app/actions/categories'
import { getLofts } from '@/app/actions/lofts'
import { Transaction as TransactionFormData } from '@/lib/validations' // Corrected import
import { useState, useEffect } from 'react'
import { Currency } from '@/lib/types'

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Loft {
  id: string;
  name: string;
}

export default function NewTransactionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [lofts, setLofts] = useState<Loft[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, loftsData, currenciesData] = await Promise.all([
          getCategories(),
          getLofts(),
          fetch('/api/currencies').then(res => res.json())
        ])
        setCategories(categoriesData)
        setLofts(loftsData)
        setCurrencies(currenciesData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

  const handleCreateTransaction = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    try {
      await createTransaction(data)
    } catch (error) {
      console.error(error)
      // Handle error state in the form
    } finally {
      setIsSubmitting(false)
    }
  }

  return <TransactionForm categories={categories} lofts={lofts} currencies={currencies} onSubmit={handleCreateTransaction} isSubmitting={isSubmitting} />
}
