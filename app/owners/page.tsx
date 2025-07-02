import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import type { LoftOwner } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { OwnersList } from "./owners-list"

export default async function OwnersPage() {
  const session = await requireRole(["admin"])
  await ensureSchema()

  if (!sql) {
    throw new Error("Database connection not available")
  }

  const owners = (await sql`
    SELECT lo.*, 
           COUNT(l.id) as loft_count,
           COALESCE(SUM(l.price_per_month), 0) as total_monthly_value
    FROM loft_owners lo
    LEFT JOIN lofts l ON lo.id = l.owner_id
    GROUP BY lo.id, lo.name, lo.email, lo.phone, lo.address, lo.ownership_type, lo.created_at, lo.updated_at
    ORDER BY lo.created_at DESC
  `) as (LoftOwner & { loft_count: string; total_monthly_value: string })[]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loft Owners</h1>
          <p className="text-muted-foreground">Manage property owners and partnerships</p>
        </div>
        <Button asChild>
          <Link href="/owners/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Owner
          </Link>
        </Button>
      </div>

      <OwnersList owners={owners} />
    </div>
  )
}
