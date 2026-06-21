import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { recordBackup } from "./recordBackup";
import { backups } from "./schema";

describe("recordBackup", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	const rows = () => orm.select().from(backups).orderBy(backups.id);

	describe("when a backup is recorded", () => {
		it("inserts a row with the file path, size, and duration", async () => {
			await recordBackup(orm, {
				filePath: "/home/me/.assist/backups/backup-2026.dump",
				sizeBytes: 2048,
				durationMs: 1500,
			});

			expect(await rows()).toEqual([
				{
					id: expect.any(Number),
					createdAt: expect.any(Date),
					filePath: "/home/me/.assist/backups/backup-2026.dump",
					sizeBytes: 2048,
					durationMs: 1500,
				},
			]);
		});
	});

	describe("when several backups are recorded", () => {
		it("inserts one row per backup", async () => {
			await recordBackup(orm, {
				filePath: "/a.dump",
				sizeBytes: 1,
				durationMs: 10,
			});
			await recordBackup(orm, {
				filePath: "/b.dump",
				sizeBytes: 2,
				durationMs: 20,
			});

			expect((await rows()).map((r) => r.filePath)).toEqual([
				"/a.dump",
				"/b.dump",
			]);
		});
	});
});
