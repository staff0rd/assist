import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { listBackups } from "./listBackups";
import { recordBackup } from "./recordBackup";

describe("listBackups", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	describe("when no backups have been recorded", () => {
		it("returns an empty list", async () => {
			expect(await listBackups(orm)).toEqual([]);
		});
	});

	describe("when several backups have been recorded", () => {
		it("returns them newest first", async () => {
			await recordBackup(orm, {
				filePath: "/a/backup-1.dump",
				sizeBytes: 100,
				durationMs: 10,
			});
			await recordBackup(orm, {
				filePath: "/a/backup-2.dump",
				sizeBytes: 200,
				durationMs: 20,
			});

			const rows = await listBackups(orm);

			expect(rows.map((r) => r.filePath)).toEqual([
				"/a/backup-2.dump",
				"/a/backup-1.dump",
			]);
		});
	});
});
