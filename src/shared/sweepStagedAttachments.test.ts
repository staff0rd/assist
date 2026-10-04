import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	utimesSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sweepStagedAttachments } from "./sweepStagedAttachments";

const DAY_MS = 24 * 60 * 60 * 1000;

let root: string;

function stage(name: string, ageMs: number, now: number): string {
	const path = join(root, name);
	mkdirSync(path);
	const time = new Date(now - ageMs);
	utimesSync(path, time, time);
	return path;
}

beforeEach(() => {
	root = mkdtempSync(join(tmpdir(), "sweep-"));
});

afterEach(() => {
	rmSync(root, { recursive: true, force: true });
});

describe("sweepStagedAttachments", () => {
	it("removes upload dirs older than a day and keeps recent ones", () => {
		const now = Date.now();
		const stale = stage("upload-old", DAY_MS + 1000, now);
		const fresh = stage("upload-new", 1000, now);

		sweepStagedAttachments(root, now);

		expect(existsSync(stale)).toBe(false);
		expect(existsSync(fresh)).toBe(true);
	});

	it("leaves entries that are not upload dirs", () => {
		const now = Date.now();
		const other = stage("other", 2 * DAY_MS, now);

		sweepStagedAttachments(root, now);

		expect(existsSync(other)).toBe(true);
	});

	it("does nothing when the staging dir does not exist", () => {
		expect(() =>
			sweepStagedAttachments(join(root, "missing"), Date.now()),
		).not.toThrow();
	});
});
