import { execSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { itemGitRefs, items } from "../../shared/db/schema";

let repo: string;
let restrictedDir: string;
let orm: Db;

vi.mock("../../shared/loadConfig", () => ({
	getProjectRoot: () => repo,
}));

vi.mock("../codeComment/getRestrictedDir", () => ({
	getRestrictedDir: () => restrictedDir,
}));

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
	closeDb: () => Promise.resolve(),
}));

import { getSchemaSessionApprovalPath } from "../schema/getSchemaSessionApprovalPath";
import { refuseLockedSchema } from "./refuseLockedSchema";

function stage(path: string, contents = "x\n"): void {
	const full = join(repo, path);
	mkdirSync(join(full, ".."), { recursive: true });
	writeFileSync(full, contents);
	execSync(`git add "${path}"`, { cwd: repo, stdio: "pipe" });
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
	repo = mkdtempSync(join(tmpdir(), "assist-schema-lock-"));
	restrictedDir = mkdtempSync(join(tmpdir(), "assist-schema-restricted-"));
	execSync("git init -q", { cwd: repo, stdio: "pipe" });
	vi.stubEnv("CLAUDECODE", "1");
	vi.stubEnv("CLAUDE_CODE_SESSION_ID", "claude-a");
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
	rmSync(repo, { recursive: true, force: true });
	rmSync(restrictedDir, { recursive: true, force: true });
});

describe("refuseLockedSchema", () => {
	it.each([
		["src/shared/db/migrations/migration0011JobRuns.ts", "x\n"],
		["src/shared/db/migrations.ts", "x\n"],
		["src/shared/db/schema.ts", "x\n"],
		["src/shared/db/jobRuns.ts", "export const jobRuns = pgTable('x', {});\n"],
	])("refuses %s with no unlock", async (path, contents) => {
		stage("src/a.ts");
		stage(path, contents);

		await expect(refuseLockedSchema()).rejects.toThrow("exit 1");
		expect(console.error).toHaveBeenCalledWith(expect.stringContaining(path));
		expect(console.error).toHaveBeenCalledWith(
			expect.stringContaining("assist schema unlock"),
		);
		expect(console.error).toHaveBeenCalledWith(
			expect.stringContaining(`git restore --staged ${path}`),
		);
	});

	it("allows db modules that define no table", async () => {
		stage("src/shared/db/getDb.ts");

		await expect(refuseLockedSchema()).resolves.toBeUndefined();
	});

	it("refuses deleting a table module", async () => {
		stage("src/shared/db/jobRuns.ts", "pgTable\n");
		execSync("git -c user.name=t -c user.email=t@t commit -qm init", {
			cwd: repo,
			stdio: "pipe",
		});
		execSync("git rm -q src/shared/db/jobRuns.ts", { cwd: repo });

		await expect(refuseLockedSchema()).rejects.toThrow("exit 1");
	});

	it("allows after a session unlock", async () => {
		const approval = getSchemaSessionApprovalPath({
			harness: "claude",
			conversationId: "claude-a",
		}) as string;
		mkdirSync(join(approval, ".."), { recursive: true });
		writeFileSync(approval, "{}");
		stage("src/shared/db/schema.ts");

		await expect(refuseLockedSchema()).resolves.toBeUndefined();
	});

	it("allows after an unlock for the item's current phase", async () => {
		vi.stubEnv(
			"ASSIST_BACKLOG_ITEM_ID",
			String(await addStoryWithPhaseUnlock(1)),
		);
		stage("src/shared/db/schema.ts");

		await expect(refuseLockedSchema()).resolves.toBeUndefined();
	});

	it("refuses when only an earlier phase was unlocked", async () => {
		const id = await addStoryWithPhaseUnlock(1);
		await orm.update(items).set({ currentPhase: 2 });
		vi.stubEnv("ASSIST_BACKLOG_ITEM_ID", String(id));
		stage("src/shared/db/schema.ts");

		await expect(refuseLockedSchema()).rejects.toThrow("exit 1");
	});

	describe("in Codex", () => {
		beforeEach(() => {
			vi.stubEnv("CLAUDECODE", undefined);
			vi.stubEnv("CODEX_THREAD_ID", "thread-a");
		});

		it("refuses a staged schema change with no unlock", async () => {
			stage("src/shared/db/schema.ts");

			await expect(refuseLockedSchema()).rejects.toThrow("exit 1");
		});

		it("refuses with only the Claude session's approval", async () => {
			const approval = getSchemaSessionApprovalPath({
				harness: "claude",
				conversationId: "thread-a",
			}) as string;
			mkdirSync(join(approval, ".."), { recursive: true });
			writeFileSync(approval, "{}");
			stage("src/shared/db/schema.ts");

			await expect(refuseLockedSchema()).rejects.toThrow("exit 1");
		});

		it("allows after this Codex conversation's unlock", async () => {
			const approval = getSchemaSessionApprovalPath({
				harness: "codex",
				conversationId: "thread-a",
			}) as string;
			mkdirSync(join(approval, ".."), { recursive: true });
			writeFileSync(
				approval,
				JSON.stringify({ harness: "codex", conversationId: "thread-a" }),
			);
			stage("src/shared/db/schema.ts");

			await expect(refuseLockedSchema()).resolves.toBeUndefined();
		});
	});

	it("allows outside any harness session", async () => {
		vi.stubEnv("CLAUDECODE", undefined);
		vi.stubEnv("CODEX_THREAD_ID", undefined);
		vi.stubEnv("CODEX_TOOL_CALL_ID", undefined);
		stage("src/shared/db/schema.ts");

		await expect(refuseLockedSchema()).resolves.toBeUndefined();
	});
});
