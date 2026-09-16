import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { advise } from "./advise";

function makeRepo(config: string): string {
	const dir = mkdtempSync(join(tmpdir(), "advise-"));
	writeFileSync(join(dir, "assist.yml"), config);
	return dir;
}

function stdinReturning(value: object): () => Promise<string> {
	return () => Promise.resolve(JSON.stringify(value));
}

describe("advise", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
	});

	it("prints the composed markdown for the cwd", async () => {
		const output = await advise({
			cwdFallback: makeRepo("notify:\n  enabled: false\n"),
		});

		expect(output).toContain("## Editing files");
		expect(logSpy).toHaveBeenCalledWith(output);
	});

	it("emits SessionStart hook JSON carrying the advice as additionalContext", async () => {
		const dir = makeRepo("notify:\n  enabled: false\n");

		const output = await advise({
			hook: true,
			stdin: stdinReturning({ cwd: dir }),
		});

		const parsed = JSON.parse(output);
		expect(parsed.hookSpecificOutput.hookEventName).toBe("SessionStart");
		expect(parsed.hookSpecificOutput.additionalContext).toContain(
			"## Editing files",
		);
	});

	it("falls back to the given cwd when the hook payload is unusable", async () => {
		const output = await advise({
			hook: true,
			stdin: () => Promise.resolve("not json"),
			cwdFallback: makeRepo("notify:\n  enabled: false\n"),
		});

		expect(JSON.parse(output).hookSpecificOutput.additionalContext).toContain(
			"## Editing files",
		);
	});

	it("explains each fragment instead of composing when --explain is given", async () => {
		const output = await advise({
			explain: true,
			cwdFallback: makeRepo("notify:\n  enabled: false\n"),
		});

		expect(output).not.toContain("# Instructions for this repo");
		expect(output).toContain("editing-files");
		expect(output).toContain("jira is not configured");
		expect(logSpy).toHaveBeenCalledWith(output);
	});
});
