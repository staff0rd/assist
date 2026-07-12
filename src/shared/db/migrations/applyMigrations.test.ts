import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import { applyMigrations } from "./applyMigrations";
import { latestMigrationId, migrations } from "./index";
import { pgliteExecutor } from "./MigrationExecutor";

const bundledIds = migrations.map((m) => m.id);

const appliedIds = async (db: PGlite): Promise<number[]> => {
	const { rows } = await db.query<{ id: number }>(
		"SELECT id FROM applied_migrations ORDER BY id",
	);
	return rows.map((row) => Number(row.id));
};

describe("applyMigrations", () => {
	it("applies each migration, records it, builds a usable schema, and is idempotent", async () => {
		const db = new PGlite();
		try {
			const applied = await applyMigrations(pgliteExecutor(db));
			expect(applied.map((m) => m.id)).toEqual(bundledIds);
			expect(await appliedIds(db)).toEqual(bundledIds);

			await db.exec(
				"INSERT INTO items (origin, name) VALUES ('test', 'an item')",
			);
			const { rows } = await db.query("SELECT name FROM items");
			expect(rows).toEqual([{ name: "an item" }]);

			const second = await applyMigrations(pgliteExecutor(db));
			expect(second).toEqual([]);
			expect(await appliedIds(db)).toEqual(bundledIds);
		} finally {
			await db.close();
		}
	}, 30000);

	it("adopts an existing schema without data loss", async () => {
		const db = new PGlite();
		try {
			await applyMigrations(pgliteExecutor(db));
			await db.exec(
				"INSERT INTO items (origin, name) VALUES ('test', 'kept row')",
			);
			await db.exec("DELETE FROM applied_migrations");

			const readopted = await applyMigrations(pgliteExecutor(db));

			expect(readopted.map((m) => m.id)).toEqual([latestMigrationId]);
			const { rows } = await db.query("SELECT name FROM items");
			expect(rows).toEqual([{ name: "kept row" }]);
		} finally {
			await db.close();
		}
	}, 30000);
});
