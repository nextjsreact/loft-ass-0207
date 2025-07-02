"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteCategory } from "@/app/actions/categories"
import Link from "next/link"
import { Category } from "@/lib/types" // Assuming Category type exists

interface CategoriesListProps {
  categories: Category[]
}

export function CategoriesList({ categories }: CategoriesListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>{category.name}</TableCell>
            <TableCell>{category.description}</TableCell>
            <TableCell>{category.type}</TableCell>
            <TableCell className="text-right flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/settings/categories/edit/${category.id}`}>Edit</Link>
              </Button>
              <form action={async () => {
                if (confirm("Are you sure you want to delete this category?")) {
                  await deleteCategory(category.id)
                }
              }}>
                <Button variant="destructive" size="sm" type="submit">Delete</Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
