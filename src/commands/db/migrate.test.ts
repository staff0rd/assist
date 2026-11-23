import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import type { MigrationExecutor } from "../../shared/db/migrations/MigrationExecutor";
import { migrations } from "../../shared/db/migrations";
import { itemGitRefs, items } from "../../shared/db/schema";

let orm: Db;
let applied: number[];
let executed: string[];
let released: Set<number> | null;
let gitCheckout: boolean;
let databaseConfigured: boolean;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
	closeDb: () => Promise.resolve(),
}));

vi.mock("../../shared/getInstallDir", () => ({
	getInstallDir: () => "/repo",
	isGitRepo: () => gitCheckout,
}));

vi.mock("./isDatabaseConfigured", () => ({
	isDatabaseConfigured: () => databaseConfigured,
}));

vi.mock("./listReleasedMigrationIds", () => ({
	listReleasedMigrationIds: () => released,
}));

vi.mock("../../shared/db/retired/findRetiredTables", () => ({
	findRetiredTables: () => Promise.resolve([]),
}));

const fakeExec: MigrationExecutor = {
	exec: async (sql) => {
		executed.push(sql);
	},
	query: async (sql, params) => {
		if (sql.includes("to_regclass")) return [{ reg: "applied_migrations" }];
		if (sql.startsWith("INSERT")) applied.push(Number(params?.[0]));
		if (sql.startsWith("SELECT id")) return applied.map((id) => ({ id }));
		return [];
	},
};

vi.mock("./withPool", () => ({
	withPool: (fn: (exec: MigrationExecutor) => Promise<void>) => fn(fakeExec),
}));

import { getSchemaSessionApprovalPath } from "../schema/getSchemaSessionApprovalPath";
import { migrate } from "./migrate";

const latest = migrations[migrations.length - 1];
const allIds = migrations.map((m) => m.id);
const appliedSql = () =>
	executed.filter((sql) => !sql.includes("CREATE TABLE IF NOT EXISTS"));
const errors = () =>
	vi
		.mocked(console.error)
		.mock.calls.map((call) => String(call[0]))
		.join("\n");

function unlockSession(): void {
	const approval = getSchemaSessionApprovalPath({
		harness: "claude",
		conversationId: "claude-a",
	}) as string;
	mkdirSync(join(approval, ".."), { recursive: true });
	writeFileSync(approval, "{}");
}

async function addStoryWithPhaseUnlock(phase: number): Promise<number> {
	const [row] = await orm
		.insert(items)
		.values({
			origin: "github.com/acme/app",
			name: "Job runs",
			status: "in-progress",
			currentPhase: 1,
		})
		.returning({ id: items.id });
	await orm.insert(itemGitRefs).values({
		itemId: row.id,
		kind: "schema-unlock",
		ref: `phase-${phase}`,
		title: "unlocked",
	});
	return row.id;
}

beforeEach(async () => {
	({ orm } = await createTestDb());
	applied = allIds.slice(0, -1);
	executed = [];
	released = new Set(allIds);
	gitCheckout = true;
	databaseConfigured = true;
	vi.stubEnv("CLAUDECODE", "1");
	vi.stubEnv("CLAUDE_CODE_SESSION_ID", `claude-${Math.random()}`);
	vi.stubEnv("ASSIST_SESSION_ID", "");
	vi.stubEnv("ASSIST_BACKLOG_ITEM_ID", "");
	vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(process, "exit").mockImplementation((code) => {
		throw new Error(`exit ${code}`);
	});
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllEnvs();
});

describe("migrate schema lock", () => {
	it("refuses in a Claude session with no unlock, naming assist schema unlock", async () => {
		await expect(migrate()).rejects.toThrow("exit 1");
		expect(errors()).toContain("assist schema unlock");
		expect(appliedSql()).toEqual([]);
	});

	it("refuses when only an earlier phase was unlocked", async () => {
		const id = await addStoryWithPhaseUnlock(1);
		await orm.update(items).set({ currentPhase: 2 });
		vi.stubEnv("ASSIST_BACKLOG_ITEM_ID", String(id));

		await expect(migrate()).rejects.toThrow("exit 1");
		expect(appliedSql()).toEqual([]);
	});

	it("applies after a session unlock", async () => {
		vi.stubEnv("CLAUDE_CODE_SESSION_ID", "claude-a");
		unlockSession();

		await migrate();
		expect(appliedSql()).toEqual([latest.sql]);
	});

	it("applies after an unlock for the item's current phase", async () => {
		vi.stubEnv(
			"ASSIST_BACKLOG_ITEM_ID",
			String(await addStoryWithPhaseUnlock(1)),
		);

		await migrate();
		expect(appliedSql()).toEqual([latest.sql]);
	});

	it("applies outside any harness session", async () => {
		vi.stubEnv("CLAUDECODE", undefined);
		vi.stubEnv("CODEX_THREAD_ID", undefined);
		vi.stubEnv("CODEX_TOOL_CALL_ID", undefined);

		await migrate();
		expect(appliedSql()).toEqual([latest.sql]);
	});
});

describe("migrate after update", () => {
	it("skips when no database is configured", async () => {
		databaseConfigured = false;
		vi.spyOn(console, "log").mockImplementation(() => {});

		await migrate({ afterUpdate: true });
		expect(executed).toEqual([]);
	});

	it("applies released migrations despite the schema lock", async () => {
		await migrate({ afterUpdate: true });
		expect(appliedSql()).toEqual([latest.sql]);
	});

	it("applies nothing when already in sync", async () => {
		applied = allIds;

		await migrate({ afterUpdate: true });
		expect(appliedSql()).toEqual([]);
	});

	it("still refuses unreleased migrations", async () => {
		released = new Set(allIds.slice(0, -1));

		await expect(migrate({ afterUpdate: true })).rejects.toThrow("exit 1");
		expect(appliedSql()).toEqual([]);
	});
});

describe("migrate unreleased migrations", () => {
	beforeEach(() => {
		vi.stubEnv("CLAUDECODE", undefined);
		vi.stubEnv("CODEX_THREAD_ID", undefined);
		vi.stubEnv("CODEX_TOOL_CALL_ID", undefined);
	});

	it("refuses pending ids absent from origin/main, naming them, and applies nothing", async () => {
		released = new Set(allIds.slice(0, -1));

		await expect(migrate()).rejects.toThrow("exit 1");
		expect(errors()).toContain(
			`not on origin/main: ${latest.id} (${latest.name})`,
		);
		expect(appliedSql()).toEqual([]);
	});

	it("refuses when origin/main cannot be read", async () => {
		released = null;

		await expect(migrate()).rejects.toThrow("exit 1");
		expect(appliedSql()).toEqual([]);
	});

	it("ignores unreleased ids that are already applied", async () => {
		applied = allIds;
		released = new Set([allIds[0]]);

		await migrate();
		expect(appliedSql()).toEqual([]);
	});

	it("skips the check for an installed build outside a git checkout", async () => {
		gitCheckout = false;
		released = new Set();

		await migrate();
		expect(appliedSql()).toEqual([latest.sql]);
	});
});
