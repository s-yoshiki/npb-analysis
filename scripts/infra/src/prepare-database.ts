import { DatabaseSync } from "node:sqlite";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.resolve(
  sourceDirectory,
  "../../../apps/web/data/npb.sqlite",
);

if (!existsSync(databasePath)) {
  throw new Error(
    `SQLite database not found at ${databasePath}. Run the parser before deploying.`,
  );
}

const db = new DatabaseSync(databasePath);

try {
  db.exec("PRAGMA wal_checkpoint(TRUNCATE)");

  const journalMode = db.prepare("PRAGMA journal_mode=DELETE").get() as {
    journal_mode: string;
  };
  const integrity = db.prepare("PRAGMA integrity_check").get() as {
    integrity_check: string;
  };
  const counts = db
    .prepare(
      `
        SELECT
          (SELECT COUNT(*) FROM players) AS players,
          (SELECT COUNT(*) FROM batting_stats) AS batting_rows,
          (SELECT COUNT(*) FROM pitching_stats) AS pitching_rows
      `,
    )
    .get() as {
    players: number;
    batting_rows: number;
    pitching_rows: number;
  };

  if (journalMode.journal_mode.toLowerCase() !== "delete") {
    throw new Error(`Failed to disable WAL mode: ${journalMode.journal_mode}`);
  }

  if (integrity.integrity_check !== "ok") {
    throw new Error(
      `SQLite integrity check failed: ${integrity.integrity_check}`,
    );
  }

  if (counts.players < 1) {
    throw new Error("SQLite database has no player records");
  }

  const sizeMb = statSync(databasePath).size / 1024 / 1024;
  console.log(
    `SQLite ready: ${sizeMb.toFixed(1)} MB, players=${counts.players}, batting=${counts.batting_rows}, pitching=${counts.pitching_rows}`,
  );
} finally {
  db.close();
}
