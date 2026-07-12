import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import { applyMigrations } from "./applyMigrations";
import { compareMigrations, getMigrationStatus } from "./getMigrationStatus";
import { latestMigrationId, migrations } from "./index";
import { pgliteExecutor } from "./MigrationExecutor";

const bundledIds = migrations.map((m) => m.id);

describe("compareMigrations", () => {
	it("reports behind with the pending ids when nothing is applied", () => {
		expect(compareMigrations([])).toEqual({
			state: "behind",
			applied: 0,
			expected: latestMigrationId,
			pending: bundledIds,
		});
	});

	it("reports in-sync when every bundled migration is applied", () => {
		expect(compareMigrations(bundledIds)).toEqual({
			state: "in-sync",
			version: latestMigrationId,
		});
	});

	it("reports ahead when the database has an id the build does not know", () => {
		expect(compareMigrations([...bundledIds, latestMigrationId + 1])).toEqual({
			state: "ahead",
			applied: latestMigrationId + 1,
			expected: latestMigrationId,
		});
	});
});

describe("getMigrationStatus", () => {
	it("reads behind before the table exists, then in-sync once applied", async () => {
		const db = new PGlite();
		try {
			expect((await getMigrationStatus(pgliteExecutor(db))).state).toBe(
				"behind",
			);
			await applyMigrations(pgliteExecutor(db));
			expect(await getMigrationStatus(pgliteExecutor(db))).toEqual({
				state: "in-sync",
				version: latestMigrationId,
			});
		} finally {
			await db.close();
		}
	}, 30000);
});
