import { NextResponse } from "next/server"
import { sql, Sql } from "@/lib/database" // Import Sql type
import { Currency } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    if (!body.code || !body.name || !body.symbol) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if currency already exists
    if (!sql) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const existingCurrency = await sql`
      SELECT * FROM currencies WHERE code = ${body.code}
    `
    
    if (existingCurrency.length > 0) {
      return NextResponse.json(
        { error: "Currency with this code already exists" },
        { status: 400 }
      )
    }

    // Create new currency
    if (!sql) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const currency = await sql`
      INSERT INTO currencies (
        code, name, symbol, decimal_digits, is_default, ratio
      ) VALUES (
        ${body.code}, 
        ${body.name}, 
        ${body.symbol}, 
        ${body.decimalDigits || 2}, 
        ${body.isDefault || false},
        ${body.ratio || 1.0}
      )
      RETURNING *
    `

    return NextResponse.json(currency)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Currency ID is required" }, { status: 400 });
    }

    if (!sql) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    // Set all currencies to not be default
    await sql`UPDATE currencies SET is_default = FALSE`;

    // Set the specified currency as default
    const result = await sql`
      UPDATE currencies
      SET is_default = TRUE
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      throw new Error("Currency not found");
    }

    return NextResponse.json({ message: "Default currency updated successfully" });
  } catch (error) {
    console.error("Error setting default currency:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const currencies = await sql`SELECT * FROM currencies`
    
    // Explicitly cast is_default to boolean for each currency
    const processedCurrencies = currencies.map(currency => ({
      ...currency,
      isDefault: Boolean(currency.is_default) // Ensure it's a boolean
    }));

    console.log("Processed Currencies (server-side):", processedCurrencies); // Debugging log
    return NextResponse.json(processedCurrencies)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
