"use client"

import type { Loft } from "@/lib/types"
import { deleteLoft } from "@/app/actions/lofts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface LoftsListProps {
  lofts: Loft[]
  isAdmin: boolean
}

export function LoftsList({ lofts, isAdmin }: LoftsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "occupied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {lofts.map((loft) => (
        <Card key={loft.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{loft.name}</CardTitle>
                <CardDescription>{loft.address}</CardDescription>
              </div>
              <Badge className={getStatusColor(loft.status)}>{loft.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monthly Rent:</span>
                <span className="font-medium">${loft.price_per_month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Owner:</span>
                <span className="font-medium">{loft.owner_name || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Company Share:</span>
                <span className="font-medium">{loft.company_percentage}%</span>
              </div>
              {loft.description && <p className="text-sm text-muted-foreground mt-2">{loft.description}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/lofts/${loft.id}`}>View</Link>
              </Button>
              {isAdmin && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/lofts/${loft.id}/edit`}>Edit</Link>
                  </Button>
                  <form action={async () => {
                    if (confirm("Are you sure you want to delete this loft?")) {
                      await deleteLoft(loft.id)
                    }
                  }}>
                    <Button variant="destructive" size="sm" type="submit">
                      Delete
                    </Button>
                  </form>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
