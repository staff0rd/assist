import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ensureGitignore } from "./ensureGitignore";

function makeTempDir(): string {
	return mkdtempSync(join(tmpdir(), "ensureGitignore-"));
}

describe("ensureGitignore", () => {
	it("should create .gitignore with entries when none exists", () => {
		const dir = makeTempDir();
		ensureGitignore(dir);
		const content = readFileSync(join(dir, ".gitignore"), "utf-8");
		expect(content).toContain(".assist-*");
		expect(content).toContain(".assist/*.db*");
	});

	it("should not duplicate entries in LF file", () => {
		const dir = makeTempDir();
		writeFileSync(join(dir, ".gitignore"), ".assist-*\n.assist/*.db*\n");
		ensureGitignore(dir);
		const content = readFileSync(join(dir, ".gitignore"), "utf-8");
		expect(content).toBe(".assist-*\n.assist/*.db*\n");
	});

	it("should not duplicate entries in CRLF file", () => {
		const dir = makeTempDir();
		writeFileSync(join(dir, ".gitignore"), ".assist-*\r\n.assist/*.db*\r\n");
		ensureGitignore(dir);
		const content = readFileSync(join(dir, ".gitignore"), "utf-8");
		expect(content).toBe(".assist-*\r\n.assist/*.db*\r\n");
	});

	it("should add missing entries to CRLF file", () => {
		const dir = makeTempDir();
		writeFileSync(join(dir, ".gitignore"), "node_modules\r\n");
		ensureGitignore(dir);
		const content = readFileSync(join(dir, ".gitignore"), "utf-8");
		expect(content).toContain(".assist-*");
		expect(content).toContain(".assist/*.db*");
	});

	it("should add only missing entries when one already exists", () => {
		const dir = makeTempDir();
		writeFileSync(join(dir, ".gitignore"), ".assist-*\r\n");
		ensureGitignore(dir);
		const content = readFileSync(join(dir, ".gitignore"), "utf-8");
		const matches = content.match(/\.assist-\*/g);
		expect(matches).toHaveLength(1);
		expect(content).toContain(".assist/*.db*");
	});
});
