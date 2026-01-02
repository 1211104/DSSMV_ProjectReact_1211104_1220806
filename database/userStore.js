import * as SQLite from "expo-sqlite";

const DB_NAME = "library_users.db";
let dbPromise = null; // Singleton para garantir uma única ligação ativa

// Abre ou cria a base de dados de forma segura
export async function openDB() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return await dbPromise;
}

export async function initUserTable() {
  try {
    const database = await openDB();
    await database.execAsync(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cc TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('Admin','Librarian','Client')),
        username TEXT NOT NULL UNIQUE
      );
      CREATE INDEX IF NOT EXISTS idx_users_role_firstname
        ON users (role, first_name);
    `);

    // Inserção do utilizador de teste
    const check = await database.getFirstAsync("SELECT COUNT(*) as count FROM users");
    if (check && check.count === 0) {
      console.log(">>> Criando utilizador de teste...");
      await database.runAsync(
          `INSERT INTO users (cc, first_name, phone, role, username)
           VALUES (?, ?, ?, ?, ?)`,
          ['12345', 'Tester', '910000000', 'Client', 'UserClientTester1']
      );
      console.log(">>> Utilizador criado! CC: 12345");
    }
  } catch (error) {
    console.error("Erro ao inicializar SQLite:", error);
  }
}

function normalizeRole(input) {
  const r = String(input || "").trim().toLowerCase();
  if (r === "admin") return "Admin";
  if (r === "librarian") return "Librarian";
  return "Client";
}

function usernamePrefix(role, firstName) {
  // Remove caracteres que possam causar problemas no URL da API
  const cleanFirst = String(firstName || "").replace(/[^A-Za-z0-9]/g, "");
  return `User${role}${cleanFirst}`;
}

async function nextSuffix(prefix) {
  const database = await openDB();
  const rows = await database.getAllAsync(
      `SELECT username FROM users WHERE username LIKE ?`,
      [`${prefix}%`]
  );
  let max = 0;
  for (const r of rows) {
    const m = String(r.username).match(new RegExp(`^${prefix}(\\d+)$`));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

export async function createUser(u) {
  // Nota: Idealmente chama initUserTable() apenas uma vez no início da App
  const database = await openDB();

  const role = normalizeRole(u.role);
  const prefix = usernamePrefix(role, u.firstName);
  const suffix = await nextSuffix(prefix);
  const username = `${prefix}${suffix}`;

  await database.runAsync(
      `INSERT INTO users (cc, first_name, phone, role, username)
       VALUES (?, ?, ?, ?, ?)`,
      [u.cc, u.firstName, u.phone, role, username]
  );

  const row = await database.getFirstAsync(
      `SELECT * FROM users WHERE username = ?`,
      [username]
  );

  return {
    id: row.id,
    cc: row.cc,
    firstName: row.first_name,
    phone: row.phone,
    role: row.role,
    username: row.username,
  };
}

// LOOKUPS + DUMP
export async function findUserByCC(cc) {
  const database = await openDB();
  const row = await database.getFirstAsync(`SELECT * FROM users WHERE cc = ?`, [cc]);
  if (!row) return null;
  return { id: row.id, cc: row.cc, firstName: row.first_name, phone: row.phone, role: row.role, username: row.username };
}

export async function findUserByUsername(username) {
  const database = await openDB();
  const row = await database.getFirstAsync(`SELECT * FROM users WHERE username = ?`, [username]);
  if (!row) return null;
  return { id: row.id, cc: row.cc, firstName: row.first_name, phone: row.phone, role: row.role, username: row.username };
}

export async function dumpUsers() {
  const database = await openDB();
  const rows = await database.getAllAsync(`SELECT * FROM users`);
  console.log("📋 USERS_DUMP:\n" + JSON.stringify(rows, null, 2));
  return rows;
}