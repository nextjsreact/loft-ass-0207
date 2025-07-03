import { User, UserRole, Loft, LoftStatus, sql } from "@/lib/database"

export async function ensureUsersTable() {
  if (!sql) {
    throw new Error("Database connection not initialized");
  }
  try {
    // Attempt to insert a dummy user to check if the table exists and is writable.
    // This will throw an error if the table does not exist.
    await sql`
      INSERT INTO users (email, password_hash, full_name) 
      VALUES ('dummy@example.com', 'dummy', 'Dummy')`;

    // If the insert succeeds, clean up the dummy user.
    try {
      await sql`DELETE FROM users WHERE email = 'dummy@example.com'`;
    } catch (deleteError) {
      console.error("Error deleting dummy user:", deleteError);
      // Not re-throwing, as this is a cleanup step. The main operation succeeded.
    }
  } catch (error: any) {
    // undefined_table
    if (error.code === '42P01') {
      // If the table does not exist, create it.
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
      try {
        await sql.unsafe(createTableQuery);
        console.log("Table 'users' created successfully.");
      } catch (createError) {
        console.error("Error creating table 'users':", createError);
        throw createError; // If creation fails, it's a critical error.
      }
    } else {
      // For other insertion errors, log them and re-throw.
      console.error("Error ensuring users table exists:", error);
      throw error;
    }
  }
}

export async function createUser(
  email: string,
  password_hash: string,
  full_name?: string,
) {
  if (!sql) {
    throw new Error("Database connection not initialized");
  }
  try {
    const data = await sql`
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES (${email}, ${password_hash}, ${full_name}, 'member')
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
