import * as SQLite from "expo-sqlite";

const DB_NAME = "library_users.db";
let db;

//Open or create the DB
export async function openDB() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  return db;
}

export async function initUserTable() {
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
}

function normalizeRole(input) {
  const r = String(input || "")
    .trim()
    .toLowerCase();
  if (r === "admin") return "Admin";
  if (r === "librarian") return "Librarian";
  return "Client";
}
function usernamePrefix(role, firstName) {
  const cleanFirst = String(firstName || "").replace(/[^A-Za-zÀ-ÿ0-9]/g, "");
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
  await initUserTable();
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
  await initUserTable();
  const database = await openDB();
  const row = await database.getFirstAsync(`SELECT * FROM users WHERE cc = ?`, [
    cc,
  ]);
  if (!row) return null;
  return {
    id: row.id,
    cc: row.cc,
    firstName: row.first_name,
    phone: row.phone,
    role: row.role,
    username: row.username,
  };
}
export async function findUserByUsername(username) {
  await initUserTable();
  const database = await openDB();
  const row = await database.getFirstAsync(
    `SELECT * FROM users WHERE username = ?`,
    [username]
  );
  if (!row) return null;
  return {
    id: row.id,
    cc: row.cc,
    firstName: row.first_name,
    phone: row.phone,
    role: row.role,
    username: row.username,
  };
}
export async function dumpUsers() {
  await initUserTable();
  const database = await openDB();
  const rows = await database.getAllAsync(`SELECT * FROM users`);
  console.log("📋 USERS_DUMP:\n" + JSON.stringify(rows, null, 2));
  return rows;
}
