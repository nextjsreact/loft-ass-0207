"use server"

import { sql } from "@/lib/database";
import { revalidatePath } from "next/cache";

export interface ZoneArea {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export async function getZoneAreas(): Promise<ZoneArea[]> {
  if (!sql) {
    throw new Error("Database connection not initialized");
  }
  try {
    const data = await sql`SELECT * FROM zone_areas ORDER BY name ASC`;
    return data as ZoneArea[];
  } catch (error) {
    console.error("Error getting zone areas:", error);
    throw error;
  }
}

export async function updateZoneArea(id: string, formData: FormData) {
  if (!sql) {
    throw new Error("Database connection not initialized");
  }
  const name = formData.get("name") as string;

  if (!name || name.trim() === "") {
    return { error: "Zone area name cannot be empty." };
  }

  try {
    await sql`UPDATE zone_areas SET name = ${name}, updated_at = NOW() WHERE id = ${id}`;
    revalidatePath("/settings/zone-areas");
    return { success: true };
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation error code
      return { error: `Zone area '${name}' already exists.` };
    }
    console.error("Error updating zone area:", error);
    throw error;
  }
}

export async function createZoneArea(formData: FormData) {
  if (!sql) {
    throw new Error("Database connection not initialized");
  }
  const name = formData.get("name") as string;

  if (!name || name.trim() === "") {
    return { error: "Zone area name cannot be empty." };
  }

  try {
    await sql`INSERT INTO zone_areas (name) VALUES (${name})`;
    revalidatePath("/settings/zone-areas");
    return { success: true };
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation error code
      return { error: `Zone area '${name}' already exists.` };
    }
    console.error("Error creating zone area:", error);
    throw error;
  }
}

export async function deleteZoneArea(id: string) {
  if (!sql) {
    throw new Error("Database connection not initialized");
  }
  try {
    await sql`DELETE FROM zone_areas WHERE id = ${id}`;
    revalidatePath("/settings/zone-areas");
    return { success: true };
  } catch (error) {
    console.error("Error deleting zone area:", error);
    throw error;
  }
}
