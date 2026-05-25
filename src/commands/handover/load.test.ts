import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { load } from "./load";
import { SUMMARISE_RECURSION_GUARD } from "./summarise";

function makeTempDir(): string {
	return mkdtempSync(join(tmpdir(), "handover-load-"));
}

function writeHandover(dir: string, content: string): string {
	const assistDir = join(dir, ".assist");
	mkdirSync(assistDir, { recursive: true });
	const path = join(assistDir, "HANDOVER.md");
	writeFileSync(path, content);
	return path;
}

function stdinReturning(value: object | string): () => Promise<string> {
	const raw = typeof value === "string" ? value : JSON.stringify(value);
	return () => Promise.resolve(raw);
}

describe("load", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
	});

	it("short-circuits silently when the recursion guard env var is set", async () => {
		const dir = makeTempDir();
		writeHandover(dir, "stale");

		const result = await load({
			stdin: stdinReturning({ cwd: dir }),
			env: { [SUMMARISE_RECURSION_GUARD]: "1" },
		});

		expect(result).toBeNull();
		expect(logSpy).not.toHaveBeenCalled();
		expect(existsSync(join(dir, ".assist", "HANDOVER.md"))).toBe(true);
	});

	it("archives the handover and emits its content as additionalContext", async () => {
		const dir = makeTempDir();
		writeHandover(dir, "# Handover\n\nbody");

		const result = await load({
			stdin: stdinReturning({ cwd: dir, session_id: "s1" }),
			env: {},
		});

		expect(result).not.toBeNull();
		const parsed = JSON.parse(result as string);
		expect(parsed.hookSpecificOutput.hookEventName).toBe("SessionStart");
		expect(parsed.hookSpecificOutput.additionalContext).toBe(
			"# Handover\n\nbody",
		);
		expect(parsed.systemMessage).toBe("Loaded handover from previous session");

		expect(existsSync(join(dir, ".assist", "HANDOVER.md"))).toBe(false);
		const archived = readdirSync(join(dir, ".assist", "handovers", "archive"));
		expect(archived).toHaveLength(1);
	});

	it("falls back to summarise when no handover exists but a prior transcript does", async () => {
		const dir = makeTempDir();
		const summariseFn = vi
			.fn()
			.mockReturnValue("Refactoring summarise pipeline");
		const findRecentFn = vi.fn().mockReturnValue("/tmp/session-abc.jsonl");

		const result = await load({
			stdin: stdinReturning({ cwd: dir, session_id: "current-session-id" }),
			env: {},
			summariseFn,
			findRecentFn,
		});

		expect(findRecentFn).toHaveBeenCalledWith(dir, "current-session-id");
		expect(summariseFn).toHaveBeenCalledWith("/tmp/session-abc.jsonl");

		const parsed = JSON.parse(result as string);
		expect(parsed.hookSpecificOutput.additionalContext).toBe(
			"Previous session: Refactoring summarise pipeline",
		);
		expect(parsed.systemMessage).toBe(
			"Previous session: Refactoring summarise pipeline",
		);
	});

	it("emits nothing when there is no handover and no eligible prior transcript", async () => {
		const dir = makeTempDir();
		const summariseFn = vi.fn();
		const findRecentFn = vi.fn().mockReturnValue(undefined);

		const result = await load({
			stdin: stdinReturning({ cwd: dir }),
			env: {},
			summariseFn,
			findRecentFn,
		});

		expect(result).toBeNull();
		expect(summariseFn).not.toHaveBeenCalled();
		expect(logSpy).not.toHaveBeenCalled();
	});

	it("emits nothing when the prior transcript yields an empty summary", async () => {
		const dir = makeTempDir();
		const result = await load({
			stdin: stdinReturning({ cwd: dir }),
			env: {},
			summariseFn: () => "",
			findRecentFn: () => "/tmp/session-abc.jsonl",
		});

		expect(result).toBeNull();
		expect(logSpy).not.toHaveBeenCalled();
	});

	it("tolerates malformed stdin JSON and falls back to cwdFallback", async () => {
		const dir = makeTempDir();
		writeHandover(dir, "fallback body");

		const result = await load({
			stdin: stdinReturning("not-json"),
			env: {},
			cwdFallback: dir,
		});

		const parsed = JSON.parse(result as string);
		expect(parsed.hookSpecificOutput.additionalContext).toBe("fallback body");
	});

	it("tolerates empty stdin and falls back to cwdFallback", async () => {
		const dir = makeTempDir();
		writeHandover(dir, "empty stdin body");

		const result = await load({
			stdin: stdinReturning(""),
			env: {},
			cwdFallback: dir,
		});

		const parsed = JSON.parse(result as string);
		expect(parsed.hookSpecificOutput.additionalContext).toBe(
			"empty stdin body",
		);
	});
});
