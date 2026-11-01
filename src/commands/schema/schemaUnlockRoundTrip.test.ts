import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { itemGitRefs, items } from "../../shared/db/schema";

const mockShowNotification = vi.fn<(...args: unknown[]) => boolean>();
let restrictedDir: string;
let orm: Db;

vi.mock("../notify/showNotification", () => ({
	showNotification: (...args: unknown[]) => mockShowNotification(...args),
}));

vi.mock("../sessions/daemon/requestDaemonReply", () => ({
	requestDaemonReply: () => Promise.resolve(undefined),
}));

vi.mock("../codeComment/getRestrictedDir", () => ({
	getRestrictedDir: () => restrictedDir,
}));

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
	closeDb: () => Promise.resolve(),
}));

vi.mock("../backlog/shared", () => ({
	findOneItem: async (id: string) => {
		const [item] = await orm
			.select()
			.from(items)
			.where(eq(items.id, Number(id)));
		return item ? { orm, item } : undefined;
	},
}));

import { isSchemaLocked } from "./isSchemaLocked";
import { schemaConfirm } from "./schemaConfirm";
import { schemaUnlock } from "./schemaUnlock";

async function addStory(): Promise<number> {
	const [row] = await orm
		.insert(items)
		.values({
			origin: "github.com/acme/app",
			name: "Job runs",
			status: "in-progress",
			currentPhase: 1,
		})
		.returning({ id: items.id });
	return row.id;
}

function issuedPin(): string {
	const [file] = readdirSync(restrictedDir).filter((f) =>
		f.startsWith("schema-unlock-pin-"),
	);
	return file.replace("schema-unlock-pin-", "").replace(".json", "");
}

function unlockRefs() {
	return orm
		.select()
		.from(itemGitRefs)
		.where(eq(itemGitRefs.kind, "schema-unlock"));
}

async function unlockAndConfirm(): Promise<void> {
	await schemaUnlock();
	await schemaConfirm(issuedPin());
}

describe("schema unlock -> confirm round-trip", () => {
	beforeEach(async () => {
		({ orm } = await createTestDb());
		restrictedDir = mkdtempSync(join(tmpdir(), "assist-schema-unlock-"));
		mockShowNotification.mockReturnValue(true);
		vi.stubEnv("ASSIST_SESSION_ID", "");
		vi.stubEnv("ASSIST_BACKLOG_ITEM_ID", "");
		vi.stubEnv("CLAUDECODE", "1");
		vi.stubEnv("CLAUDE_CODE_SESSION_ID", "claude-a");
		process.exitCode = undefined;
		vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		vi.unstubAllEnvs();
		process.exitCode = undefined;
		rmSync(restrictedDir, { recursive: true, force: true });
	});

	it("does not lock outside Claude Code", async () => {
		vi.stubEnv("CLAUDECODE", "");
		expect(await isSchemaLocked()).toBe(false);
	});

	it("unlocks the item's current phase only and records a schema-unlock activity", async () => {
		const id = await addStory();
		vi.stubEnv("ASSIST_BACKLOG_ITEM_ID", String(id));
		expect(await isSchemaLocked()).toBe(true);

		await unlockAndConfirm();

		expect(process.exitCode).toBeUndefined();
		expect(await unlockRefs()).toEqual([
			expect.objectContaining({ itemId: id, ref: "phase-1" }),
		]);
		expect(await isSchemaLocked()).toBe(false);

		await orm.update(items).set({ currentPhase: 2 }).where(eq(items.id, id));
		expect(await isSchemaLocked()).toBe(true);
	});

	it.each(["done", "wontdo"])(
		"locks again once the item is %s",
		async (status) => {
			const id = await addStory();
			vi.stubEnv("ASSIST_BACKLOG_ITEM_ID", String(id));
			await unlockAndConfirm();

			await orm.update(items).set({ status }).where(eq(items.id, id));
			expect(await isSchemaLocked()).toBe(true);
		},
	);

	it("rejects a pin once the item has moved on to another phase", async () => {
		const id = await addStory();
		vi.stubEnv("ASSIST_BACKLOG_ITEM_ID", String(id));
		await schemaUnlock();
		await orm.update(items).set({ currentPhase: 2 }).where(eq(items.id, id));

		await schemaConfirm(issuedPin());

		expect(process.exitCode).toBe(1);
		expect(await unlockRefs()).toEqual([]);
	});

	it("unlocks only the Claude session when there is no backlog item", async () => {
		expect(await isSchemaLocked()).toBe(true);

		await unlockAndConfirm();

		expect(process.exitCode).toBeUndefined();
		expect(await isSchemaLocked()).toBe(false);
		vi.stubEnv("CLAUDE_CODE_SESSION_ID", "claude-b");
		expect(await isSchemaLocked()).toBe(true);
	});

	it("fails without a backlog item or Claude session", async () => {
		vi.stubEnv("CLAUDE_CODE_SESSION_ID", "");
		await schemaUnlock();

		expect(process.exitCode).toBe(1);
		expect(mockShowNotification).not.toHaveBeenCalled();
	});

	it("rejects an unknown pin without approving anything", async () => {
		await schemaConfirm("999");

		expect(process.exitCode).toBe(1);
		expect(await isSchemaLocked()).toBe(true);
	});
});
