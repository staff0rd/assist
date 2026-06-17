import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	utimesSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { handovers } from "../../shared/db/schema";
import { migrateDiskHandovers } from "./migrateDiskHandovers";

const ORIGIN = "github.com/acme/repo";

function makeTempDir(): string {
	return mkdtempSync(join(tmpdir(), "handover-migrate-"));
}

async function rows(orm: Db) {
	return orm
		.select()
		.from(handovers)
		.where(eq(handovers.origin, ORIGIN))
		.orderBy(handovers.createdAt);
}

describe("migrateDiskHandovers", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	it("is a no-op when nothing is on disk", async () => {
		const dir = makeTempDir();
		expect(await migrateDiskHandovers(orm, ORIGIN, dir)).toBe(0);
		expect(await rows(orm)).toHaveLength(0);
	});

	it("migrates the current HANDOVER.md and removes it", async () => {
		const dir = makeTempDir();
		mkdirSync(join(dir, ".assist"), { recursive: true });
		const path = join(dir, ".assist", "HANDOVER.md");
		writeFileSync(path, "# Handover\n\nactive work here");

		const count = await migrateDiskHandovers(orm, ORIGIN, dir);

		expect(count).toBe(1);
		expect(existsSync(path)).toBe(false);
		const all = await rows(orm);
		expect(all).toHaveLength(1);
		expect(all[0].content).toBe("# Handover\n\nactive work here");
		expect(all[0].summary).toBe("active work here");
		expect(all[0].recalledAt).toBeNull();
	});

	it("migrates archived notes preserving the timestamp from the filename", async () => {
		const dir = makeTempDir();
		const archiveDir = join(dir, ".assist", "handovers", "archive");
		mkdirSync(archiveDir, { recursive: true });
		const archived = join(archiveDir, "2026-05-25T143022Z.md");
		writeFileSync(archived, "older note");

		await migrateDiskHandovers(orm, ORIGIN, dir);

		expect(existsSync(archived)).toBe(false);
		const all = await rows(orm);
		expect(all).toHaveLength(1);
		expect(all[0].createdAt).toEqual(new Date("2026-05-25T14:30:22Z"));
	});

	it("falls back to mtime for archive notes without a timestamp name", async () => {
		const dir = makeTempDir();
		const handoversDir = join(dir, ".assist", "handovers");
		mkdirSync(handoversDir, { recursive: true });
		const note = join(handoversDir, "notes.md");
		writeFileSync(note, "untimed note");
		const mtime = new Date("2026-03-03T03:03:03Z");
		utimesSync(note, mtime, mtime);

		await migrateDiskHandovers(orm, ORIGIN, dir);

		const all = await rows(orm);
		expect(all).toHaveLength(1);
		expect(all[0].createdAt).toEqual(mtime);
	});

	it("is idempotent — a second run migrates nothing", async () => {
		const dir = makeTempDir();
		mkdirSync(join(dir, ".assist"), { recursive: true });
		writeFileSync(join(dir, ".assist", "HANDOVER.md"), "body");

		expect(await migrateDiskHandovers(orm, ORIGIN, dir)).toBe(1);
		expect(await migrateDiskHandovers(orm, ORIGIN, dir)).toBe(0);
		expect(await rows(orm)).toHaveLength(1);
	});
});
