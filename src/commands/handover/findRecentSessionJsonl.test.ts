import { mkdtempSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findRecentSessionJsonl } from "./findRecentSessionJsonl";

function makeProjectDir(): string {
	return mkdtempSync(join(tmpdir(), "handover-find-"));
}

function writeJsonl(
	dir: string,
	id: string,
	entries: { text: string; entrypoint?: string }[],
	mtimeSec: number,
): string {
	const path = join(dir, `${id}.jsonl`);
	const lines = entries.map((e) =>
		JSON.stringify({
			type: "user",
			entrypoint: e.entrypoint,
			message: { content: e.text },
		}),
	);
	writeFileSync(path, `${lines.join("\n")}\n`);
	utimesSync(path, mtimeSec, mtimeSec);
	return path;
}

describe("findRecentSessionJsonl", () => {
	it("returns undefined when the project directory is missing", () => {
		const result = findRecentSessionJsonl("/home/no/such/dir", {
			projectDir: "/no/such/projectdir",
		});
		expect(result).toBeUndefined();
	});

	it("returns the most recent eligible JSONL", () => {
		const dir = makeProjectDir();
		const older = writeJsonl(
			dir,
			"older",
			[{ text: "x", entrypoint: "cli" }],
			1000,
		);
		const newer = writeJsonl(
			dir,
			"newer",
			[{ text: "y", entrypoint: "cli" }],
			2000,
		);

		const result = findRecentSessionJsonl("/cwd", { projectDir: dir });
		expect(result).toBe(newer);
		expect(older).toContain("older.jsonl");
	});

	it("skips the current session id", () => {
		const dir = makeProjectDir();
		const older = writeJsonl(
			dir,
			"older",
			[{ text: "x", entrypoint: "cli" }],
			1000,
		);
		writeJsonl(dir, "current", [{ text: "y", entrypoint: "cli" }], 2000);

		const result = findRecentSessionJsonl("/cwd", {
			projectDir: dir,
			excludeSessionId: "current",
		});
		expect(result).toBe(older);
	});

	it("skips sdk-cli-only transcripts", () => {
		const dir = makeProjectDir();
		const real = writeJsonl(
			dir,
			"real",
			[{ text: "x", entrypoint: "cli" }],
			1000,
		);
		writeJsonl(
			dir,
			"sdk",
			[
				{ text: "a", entrypoint: "sdk-cli" },
				{ text: "b", entrypoint: "sdk-cli" },
			],
			2000,
		);

		const result = findRecentSessionJsonl("/cwd", { projectDir: dir });
		expect(result).toBe(real);
	});

	it("returns undefined when only sdk-cli transcripts exist", () => {
		const dir = makeProjectDir();
		writeJsonl(dir, "sdk", [{ text: "a", entrypoint: "sdk-cli" }], 1000);

		const result = findRecentSessionJsonl("/cwd", { projectDir: dir });
		expect(result).toBeUndefined();
	});

	it("treats empty transcripts (zero user entries) as ineligible", () => {
		const dir = makeProjectDir();
		writeFileSync(join(dir, "empty.jsonl"), "");
		utimesSync(join(dir, "empty.jsonl"), 1500, 1500);
		const real = writeJsonl(
			dir,
			"real",
			[{ text: "x", entrypoint: "cli" }],
			1000,
		);

		const result = findRecentSessionJsonl("/cwd", { projectDir: dir });
		expect(result).toBe(real);
	});

	it("treats any non-sdk-cli entrypoint as interactive", () => {
		const dir = makeProjectDir();
		const mixed = writeJsonl(
			dir,
			"mixed",
			[
				{ text: "a", entrypoint: "sdk-cli" },
				{ text: "b", entrypoint: "cli" },
			],
			1000,
		);

		const result = findRecentSessionJsonl("/cwd", { projectDir: dir });
		expect(result).toBe(mixed);
	});
});
