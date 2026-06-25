import { existsSync, mkdtempSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { sweepRestrictedDir } from "./sweepRestrictedDir";

describe("sweepRestrictedDir", () => {
	let dir: string;

	afterEach(() => {
		dir = "";
	});

	function seed(name: string, ageMs: number): string {
		const path = join(dir, name);
		writeFileSync(path, "{}");
		const seconds = (Date.now() - ageMs) / 1000;
		utimesSync(path, seconds, seconds);
		return path;
	}

	it("removes files older than 30 minutes", () => {
		dir = mkdtempSync(join(tmpdir(), "sweep-stale-"));
		const stale = seed("code-comment-old.json", 31 * 60 * 1000);

		sweepRestrictedDir(dir);

		expect(existsSync(stale)).toBe(false);
	});

	it("keeps files younger than 30 minutes", () => {
		dir = mkdtempSync(join(tmpdir(), "sweep-fresh-"));
		const fresh = seed("code-comment-new.json", 5 * 60 * 1000);

		sweepRestrictedDir(dir);

		expect(existsSync(fresh)).toBe(true);
	});

	it("does nothing when the directory is missing", () => {
		dir = join(tmpdir(), "sweep-absent-does-not-exist");

		expect(() => sweepRestrictedDir(dir)).not.toThrow();
	});
});
