import { User, UserRole, Loft, LoftStatus, sql } from "@/lib/database"

export async function ensureUsersTable() {
  if (!sql) {
    throw new Error("Database connection not initialized");
  }
  try {
    // Attempt to insert a dummy user to check if the table exists and is writable
    const [, insertError] = await sql`
      INSERT INTO users (email, password_hash, full_name) 
      VALUES ('dummy@example.com', 'dummy', 'Dummy')`;

    if (insertError && insertError.message && insertError.message.includes('relation "users" does not exist')) {
      // If the table does not exist, create it
      const createTableQuery = `
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          full_name TEXT,
          role TEXT NOT NULL DEFAULT 'member',
          email_verified BOOLEAN DEFAULT false,
          reset_token TEXT,
          reset_token_expires TIMESTAMPTZ,
          last_login TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      await sql.unsafe(createTableQuery);
      console.log("Table 'users' created successfully.");
    } else if (insertError) {
      // For other insertion errors, log them
      console.error("Error inserting dummy user:", insertError);
    }

    // Clean up the dummy user
    const [, deleteError] = await sql`DELETE FROM users WHERE email = 'dummy@example.com'`;
    if (deleteError) {
      console.error("Error deleting dummy user:", deleteError);
    }
  } catch (error) {
    console.error("Error ensuring users table exists:", error);
    throw error;
  }
}

export async function createUser(
  email: string,
  password_hash: string,
  full_name?: string,
  role: UserRole = 'member'
) {
  if (!sql) {
    throw new Error("Database connection not initialized");
  }
  try {
    const data = await sql`
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES (${email}, ${password_hash}, ${full_name}, ${role})
      RETURNING *
    `

    return data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function getUserWithRelations(email: string) {
  if (!sql) {
    throw new Error("Database connection not initialized");
  }
  try {
    const data = await sql`
      SELECT *
      FROM users
      WHERE email = ${email}
    `

    const user = data?.[0] as User | undefined
    return user
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

export async function getAllLofts() {
  if (!sql) {
    throw new Error("Database connection not initialized");
  }
  try {
    const data = await sql`
      SELECT * 
      FROM lofts
    `
    return data as Loft[] | undefined
  } catch (error) {
    console.error('Error getting all lofts:', error)
    throw error
  }
}

export async function getOwnerLofts(ownerId: string) {
  if (!sql) {
    throw new Error("Database connection not initialized");
  }
  try {
    const data = await sql`
      SELECT * FROM lofts WHERE owner_id = ${ownerId}
    `
    return data as Loft[] | undefined
  } catch (error) {
    console.error('Error getting owner lofts:', error)
    throw error
  }
}
