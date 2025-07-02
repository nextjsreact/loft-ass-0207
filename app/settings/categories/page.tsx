import { requireRole } from "@/lib/auth"
import { getCategories, createCategory } from "@/app/actions/categories" // deleteCategory will be handled by client component
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CategoriesList } from "./categories-list"

export default async function CategoriesPage() {
  await requireRole(["admin"])
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
          <CardDescription>Add a new category for transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (formData) => {
            "use server"
            await createCategory({
              name: formData.get("name") as string,
              description: formData.get("description") as string,
              type: formData.get("type") as string,
            })
          }} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit">Create Category</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoriesList categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}
