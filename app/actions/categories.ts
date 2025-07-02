"use server"

import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { revalidatePath } from "next/cache"
import type { Category } from "@/lib/types"

export async function getCategories(): Promise<Category[]> {
  await ensureSchema()
  if (!sql) {
    throw new Error("Database connection not available")
  }
  const categories = await sql`SELECT * FROM categories ORDER BY name`
  return categories as Category[]
}

export async function getCategory(id: string): Promise<Category | null> {
  await ensureSchema()
  if (!sql) {
    throw new Error("Database connection not available")
  }
  const [category] = await sql`SELECT * FROM categories WHERE id = ${id}`
  return category as Category || null
}

export async function createCategory(data: { name: string; description: string; type: string }) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  try {
    if (!sql) {
      throw new Error("Database connection not available")
    }
    await sql`
      INSERT INTO categories (name, description, type)
      VALUES (${data.name}, ${data.description}, ${data.type})
    `
    revalidatePath("/settings/categories")
  } catch (error) {
    console.error("Error creating category:", error)
    throw error
  }
}

export async function updateCategory(id: string, data: { name: string; description: string; type: string }) {
  await requireRole(["admin"])
  await ensureSchema()

  try {
    if (!sql) {
      throw new Error("Database connection not available")
    }
    await sql`
      UPDATE categories
      SET name = ${data.name}, description = ${data.description}, type = ${data.type}
      WHERE id = ${id}
    `
    revalidatePath("/settings/categories")
  } catch (error) {
    console.error("Error updating category:", error)
    throw error
  }
}

export async function deleteCategory(id: string) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  try {
    if (!sql) {
      throw new Error("Database connection not available")
    }
    await sql`DELETE FROM categories WHERE id = ${id}`
    revalidatePath("/settings/categories")
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }
}
