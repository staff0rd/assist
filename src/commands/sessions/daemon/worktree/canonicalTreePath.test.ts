import { mkdirSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { canonicalTreePath } from "./canonicalTreePath";

describe("canonicalTreePath", () => {
	let dir: string;

	beforeEach(() => {
		dir = realpathSync.native(mkdtempSync(join(tmpdir(), "canonical-tree-")));
	});

	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	it("resolves an equivalent spelling of an existing tree to the same path", () => {
		mkdirSync(join(dir, "x"));
		expect(canonicalTreePath(`${dir}/x/..`)).toBe(dir);
	});

	it.runIf(process.platform === "win32")(
		"returns the on-disk casing on Windows",
		() => {
			expect(canonicalTreePath(dir.toLowerCase())).toBe(dir);
			expect(canonicalTreePath(dir.toUpperCase())).toBe(dir);
		},
	);

	it("falls back to the resolved path for a tree that does not exist", () => {
		expect(canonicalTreePath(`${dir}/missing/../gone`)).toBe(join(dir, "gone"));
	});
});
