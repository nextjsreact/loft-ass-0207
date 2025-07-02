import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import type { Loft } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { LoftsList } from "./lofts-list"

export default async function LoftsPage() {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  try {
    if (!sql) {
      throw new Error("Database connection not available")
    }
    const lofts = (await sql`
      SELECT l.*, lo.name as owner_name, lo.ownership_type
      FROM lofts l
      LEFT JOIN loft_owners lo ON l.owner_id = lo.id
      ORDER BY l.created_at DESC
    `) as Loft[]

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lofts</h1>
            <p className="text-muted-foreground">Manage your loft properties</p>
          </div>
          {session.user.role === "admin" && (
            <Button asChild>
              <Link href="/lofts/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Loft
              </Link>
            </Button>
          )}
        </div>
        <LoftsList lofts={lofts} isAdmin={session.user.role === "admin"} />
      </div>
    )
  } catch (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lofts</h1>
          <p className="text-muted-foreground">Loading loft data...</p>
        </div>
      </div>
    )
  }
}
