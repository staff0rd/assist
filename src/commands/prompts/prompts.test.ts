import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	_resetPromptsDb,
	logDeniedToolCall,
	openPromptsDb,
} from "../cliHook/logDeniedToolCall";
import { prompts } from "./prompts";

let tempDir: string;

beforeEach(() => {
	tempDir = mkdtempSync(join(tmpdir(), "prompts-cmd-test-"));
	openPromptsDb(tempDir);
});

afterEach(() => {
	_resetPromptsDb();
	rmSync(tempDir, { recursive: true, force: true });
});

describe("prompts", () => {
	it("prints empty message when no rows exist", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		prompts();
		expect(consoleSpy).toHaveBeenCalledWith(
			"No denied tool calls recorded yet.",
		);
		consoleSpy.mockRestore();
	});

	it("lists denied tool calls ranked by frequency", () => {
		for (let i = 0; i < 5; i++) {
			logDeniedToolCall({
				tool: "Bash",
				command: "npm publish",
				repo: "my-app",
				denyReason: "denied",
			});
		}
		for (let i = 0; i < 2; i++) {
			logDeniedToolCall({
				tool: "PowerShell",
				command: "Remove-Item -Recurse",
				repo: "other-repo",
				denyReason: "denied",
			});
		}

		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		prompts();

		const lines = consoleSpy.mock.calls.map((c) => c[0] as string);
		// Header + separator + 2 data rows = 4 lines
		expect(lines).toHaveLength(4);
		// First data row should be the most frequent
		expect(lines[2]).toContain("5");
		expect(lines[2]).toContain("npm publish");
		// Second data row
		expect(lines[3]).toContain("2");
		expect(lines[3]).toContain("Remove-Item");

		consoleSpy.mockRestore();
	});

	it("groups repos with GROUP_CONCAT", () => {
		logDeniedToolCall({
			tool: "Bash",
			command: "rm -rf /",
			repo: "repo-a",
			denyReason: "denied",
		});
		logDeniedToolCall({
			tool: "Bash",
			command: "rm -rf /",
			repo: "repo-b",
			denyReason: "denied",
		});

		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		prompts();

		const lines = consoleSpy.mock.calls.map((c) => c[0] as string);
		const dataRow = lines[2];
		expect(dataRow).toContain("repo-a");
		expect(dataRow).toContain("repo-b");

		consoleSpy.mockRestore();
	});

	it("limits output to 10 rows", () => {
		for (let i = 0; i < 15; i++) {
			logDeniedToolCall({
				tool: "Bash",
				command: `cmd-${i}`,
				repo: "repo",
				denyReason: "denied",
			});
		}

		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		prompts();

		const lines = consoleSpy.mock.calls.map((c) => c[0] as string);
		// Header + separator + 10 data rows = 12
		expect(lines).toHaveLength(12);

		consoleSpy.mockRestore();
	});
});
