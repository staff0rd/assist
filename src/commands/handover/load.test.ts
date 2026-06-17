import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { getCurrentOrigin } from "../backlog/getCurrentOrigin";
import { load } from "./load";
import { saveHandover } from "./saveHandover";

function makeTempDir(): string {
	return mkdtempSync(join(tmpdir(), "handover-load-"));
}

function writeHandover(dir: string, content: string): void {
	const assistDir = join(dir, ".assist");
	mkdirSync(assistDir, { recursive: true });
	writeFileSync(join(assistDir, "HANDOVER.md"), content);
}

function stdinReturning(value: object): () => Promise<string> {
	return () => Promise.resolve(JSON.stringify(value));
}

describe("load", () => {
	let orm: Db;
	let close: () => Promise<void>;
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(async () => {
		logSpy.mockRestore();
		await close();
	});

	it("emits nothing when no handovers exist on disk or in the DB", async () => {
		const dir = makeTempDir();

		const result = await load({ stdin: stdinReturning({ cwd: dir }), orm });

		expect(result).toBeNull();
		expect(logSpy).not.toHaveBeenCalled();
	});

	it("migrates a disk handover and advises the unrecalled count", async () => {
		const dir = makeTempDir();
		writeHandover(dir, "# Handover\n\nshipping the thing");

		const result = await load({ stdin: stdinReturning({ cwd: dir }), orm });

		expect(result).not.toBeNull();
		const parsed = JSON.parse(result as string);
		expect(parsed.hookSpecificOutput.hookEventName).toBe("SessionStart");
		expect(parsed.hookSpecificOutput.additionalContext).toBeUndefined();
		expect(parsed.systemMessage).toBe(
			"1 unrecalled handover for this repo. Run /recall to load.",
		);
	});

	it("pluralises the advisory for multiple unrecalled handovers", async () => {
		const dir = makeTempDir();
		const origin = getCurrentOrigin(dir);
		await saveHandover(orm, { origin, summary: "one", content: "a" });
		await saveHandover(orm, { origin, summary: "two", content: "b" });

		const result = await load({ stdin: stdinReturning({ cwd: dir }), orm });

		const parsed = JSON.parse(result as string);
		expect(parsed.systemMessage).toBe(
			"2 unrecalled handovers for this repo. Run /recall to load.",
		);
	});
});
