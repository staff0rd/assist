import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	_resetPromptsDb,
	logDeniedToolCall,
	openPromptsDb,
} from "./logDeniedToolCall";

let tempDir: string;

beforeEach(() => {
	tempDir = mkdtempSync(join(tmpdir(), "promptsDb-test-"));
});

afterEach(() => {
	_resetPromptsDb();
	rmSync(tempDir, { recursive: true, force: true });
});

describe("openPromptsDb", () => {
	it("creates the database and denied_tool_calls table", () => {
		const db = openPromptsDb(tempDir);
		const tables = db
			.prepare(
				"SELECT name FROM sqlite_master WHERE type='table' AND name='denied_tool_calls'",
			)
			.all();
		expect(tables).toHaveLength(1);
	});

	it("returns the same instance on subsequent calls", () => {
		const db1 = openPromptsDb(tempDir);
		const db2 = openPromptsDb(tempDir);
		expect(db1).toBe(db2);
	});

	it("uses WAL journal mode", () => {
		const db = openPromptsDb(tempDir);
		const mode = db.pragma("journal_mode", { simple: true });
		expect(mode).toBe("wal");
	});
});

describe("logDeniedToolCall", () => {
	it("inserts a row with all fields", () => {
		openPromptsDb(tempDir);
		logDeniedToolCall({
			tool: "Bash",
			command: "rm -rf /",
			repo: "my-repo",
			sessionId: "sess-123",
			denyReason: "Do not use rm -rf",
		});

		const db = openPromptsDb(tempDir);
		const rows = db.prepare("SELECT * FROM denied_tool_calls").all() as {
			tool: string;
			command: string;
			repo: string;
			session_id: string;
			deny_reason: string;
			timestamp: string;
		}[];
		expect(rows).toHaveLength(1);
		expect(rows[0].tool).toBe("Bash");
		expect(rows[0].command).toBe("rm -rf /");
		expect(rows[0].repo).toBe("my-repo");
		expect(rows[0].session_id).toBe("sess-123");
		expect(rows[0].deny_reason).toBe("Do not use rm -rf");
		expect(rows[0].timestamp).toBeTruthy();
	});

	it("stores null session_id when not provided", () => {
		openPromptsDb(tempDir);
		logDeniedToolCall({
			tool: "PowerShell",
			command: "Remove-Item -Recurse",
			repo: "test-repo",
			denyReason: "Denied by settings: Remove-Item",
		});

		const db = openPromptsDb(tempDir);
		const row = db
			.prepare("SELECT session_id FROM denied_tool_calls")
			.get() as { session_id: string | null };
		expect(row.session_id).toBeNull();
	});

	it("inserts multiple rows", () => {
		openPromptsDb(tempDir);
		for (let i = 0; i < 3; i++) {
			logDeniedToolCall({
				tool: "Bash",
				command: `cmd-${i}`,
				repo: "repo",
				denyReason: "denied",
			});
		}

		const db = openPromptsDb(tempDir);
		const count = db
			.prepare("SELECT COUNT(*) as c FROM denied_tool_calls")
			.get() as { c: number };
		expect(count.c).toBe(3);
	});
});
