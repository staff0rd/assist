import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findBacklogUp } from "./findBacklogUp";

function makeTempDir(): string {
	return mkdtempSync(join(tmpdir(), "findBacklogUp-"));
}

describe("findBacklogUp", () => {
	it("returns the directory containing assist.backlog.yml when called from it", () => {
		const root = makeTempDir();
		writeFileSync(join(root, "assist.backlog.yml"), "");
		expect(findBacklogUp(root)).toBe(root);
	});

	it("walks up to find assist.backlog.yml from a subdirectory", () => {
		const root = makeTempDir();
		const sub = join(root, "subdir");
		mkdirSync(sub);
		writeFileSync(join(root, "assist.backlog.yml"), "");
		expect(findBacklogUp(sub)).toBe(root);
	});

	it("walks up to find .assist/backlog.jsonl from a deeply nested subdirectory", () => {
		const root = makeTempDir();
		const deep = join(root, "a", "b", "c");
		mkdirSync(deep, { recursive: true });
		mkdirSync(join(root, ".assist"));
		writeFileSync(join(root, ".assist", "backlog.jsonl"), "");
		expect(findBacklogUp(deep)).toBe(root);
	});

	it("walks up to find .assist/backlog.db from a subdirectory", () => {
		const root = makeTempDir();
		const sub = join(root, "docker");
		mkdirSync(sub);
		mkdirSync(join(root, ".assist"));
		writeFileSync(join(root, ".assist", "backlog.db"), "");
		expect(findBacklogUp(sub)).toBe(root);
	});

	it("returns null when no backlog marker is found anywhere up the tree", () => {
		const root = makeTempDir();
		const sub = join(root, "nothing-here");
		mkdirSync(sub);
		expect(findBacklogUp(sub)).toBeNull();
	});
});
