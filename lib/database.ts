import { neon } from "@neondatabase/serverless"
import { dbConfig } from "./db-config"
// import fs from "fs"
import { NeonQueryFunction } from "@neondatabase/serverless" // Import NeonQueryFunction

let sql: NeonQueryFunction<false, false> | null = null // Type sql as NeonQueryFunction with default generics
export type Sql = NeonQueryFunction<false, false>; // Export Sql type alias with default generics

if (typeof window === 'undefined') {
  try {
    if (!dbConfig.connectionString) {
      throw new Error('Database connection string not configured')
    }
    sql = neon(dbConfig.connectionString)
    console.log('Database connection established')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

export function createAuthenticatedClient(token: string) {
  // This is a placeholder. In a real application, you would use the
  // token to create a new database client with the user's permissions.
  return sql;
}

export { sql }

let _schemaInitialized = false

export async function ensureSchema() {
  if (_schemaInitialized || typeof window !== 'undefined' || !sql) return
  _schemaInitialized = true

  try {
    // Ensure roles exist before any policies or functions are created
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN CREATE ROLE admin; END IF; END$$;`;
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'manager') THEN CREATE ROLE manager; END IF; END$$;`;
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'member') THEN CREATE ROLE member; END IF; END$$;`;

    // const schemaSql = await fs.promises.readFile('./scripts/01-create-schema.sql', 'utf-8');
    // await sql.unsafe(schemaSql);
    // const rlsSql = await fs.promises.readFile('./scripts/02-setup-rls.sql', 'utf-8');
    // await sql.unsafe(rlsSql);
    
    // Create currencies table if it doesn't exist (fallback)
    await sql`
      CREATE TABLE IF NOT EXISTS currencies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(3) NOT NULL UNIQUE,
        name VARCHAR(50) NOT NULL,
        symbol VARCHAR(3) NOT NULL,
        decimal_digits INTEGER NOT NULL DEFAULT 2,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `

    // Create index on code field
    await sql`
      CREATE INDEX IF NOT EXISTS currencies_code_idx ON currencies (code)
    `

    // Add RLS policy for currencies
    await sql`
      ALTER TABLE currencies ENABLE ROW LEVEL SECURITY
    `

    // Admin can do anything with currencies
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admin_all_currencies' AND polrelid = 'currencies'::regclass) THEN
          CREATE POLICY admin_all_currencies ON currencies FOR ALL TO admin USING (true);
        END IF;
      END
      $$;
    `;

    // Managers can view currencies but not modify
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'manager_view_currencies' AND polrelid = 'currencies'::regclass) THEN
          CREATE POLICY manager_view_currencies ON currencies FOR SELECT TO manager USING (true);
        END IF;
      END
      $$;
    `;

    // Members can view currencies but not modify
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'member_view_currencies' AND polrelid = 'currencies'::regclass) THEN
          CREATE POLICY member_view_currencies ON currencies FOR SELECT TO member USING (true);
        END IF;
      END
      $$;
    `
  } catch (error) {
    console.error('Schema initialization failed:', error)
  }
}

export type UserRole = "admin" | "manager" | "member"
export type TaskStatus = "todo" | "in_progress" | "completed"
export type LoftStatus = "available" | "occupied" | "maintenance"
export type TransactionStatus = "pending" | "completed" | "failed"
export type LoftOwnership = "company" | "third_party"

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  password_hash?: string
  email_verified?: boolean
  reset_token?: string
  reset_token_expires?: string
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  description?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface LoftOwner {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  ownership_type: LoftOwnership
  created_at: string
  updated_at: string
}

export interface Loft {
  id: string
  name: string
  description?: string
  address: string
  price_per_month: number
  status: LoftStatus
  owner_id: string
  company_percentage: number
  owner_percentage: number
  zone_area_id?: string | null;
  created_at: string
  updated_at: string
  owner?: LoftOwner
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  due_date?: string
  assigned_to?: string
  team_id?: string
  loft_id?: string
  created_by: string
  created_at: string
  updated_at: string
  assigned_user?: User
  team?: Team
  loft?: Loft
}

export interface Transaction {
  id: string
  amount: number
  description?: string
  transaction_type: string
  status: TransactionStatus
  task_id?: string
  loft_id?: string
  user_id?: string
  processed_at?: string
  created_at: string
  updated_at: string
  loft?: Loft
  user?: User
}

export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  decimalDigits: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}
