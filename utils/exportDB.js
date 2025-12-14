import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const DB_NAME = "library_users.db";
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

export async function exportDatabase() {
  const info = await FileSystem.getInfoAsync(DB_PATH);
  if (!info.exists) {
    throw new Error("Database file not found at: " + DB_PATH);
  }
  await Sharing.shareAsync(DB_PATH, { dialogTitle: "Exportar base de dados" });
}

//Export all users in readable JSON and share
export async function exportUsersJson(rows) {
  let data = rows;
  if (!Array.isArray(rows)) {
    const text =
      "Chama exportUsersJson(dump) com o resultado de dumpUsers() para evitar 2 acessos.";
    console.warn(text);
    data = [];
  }
  const uri = `${FileSystem.documentDirectory}users_dump.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2));
  await Sharing.shareAsync(uri, {
    dialogTitle: "Exportar utilizadores (JSON)",
    mimeType: "application/json",
  });
}
