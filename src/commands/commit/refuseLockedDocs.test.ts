import { execSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockLocked = vi.fn<() => Promise<boolean>>();
let repo: string;

vi.mock("../backlog/isDocsLocked", () => ({
	isDocsLocked: () => mockLocked(),
}));

vi.mock("../../shared/loadConfig", () => ({
	getProjectRoot: () => repo,
}));

import { refuseLockedDocs } from "./refuseLockedDocs";

function stage(path: string): void {
	const full = join(repo, path);
	mkdirSync(join(full, ".."), { recursive: true });
	writeFileSync(full, "x\n");
	execSync(`git add "${path}"`, { cwd: repo, stdio: "pipe" });
}

beforeEach(() => {
	repo = mkdtempSync(join(tmpdir(), "assist-docs-lock-"));
	execSync("git init -q", { cwd: repo, stdio: "pipe" });
	vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(process, "exit").mockImplementation((code) => {
		throw new Error(`exit ${code}`);
	});
	mockLocked.mockReset();
	mockLocked.mockResolvedValue(true);
});

afterEach(() => {
	vi.restoreAllMocks();
	rmSync(repo, { recursive: true, force: true });
});

describe("refuseLockedDocs", () => {
	it("refuses when locked and a staged path is under docs/", async () => {
		stage("src/a.ts");
		stage("docs/page.md");

		await expect(refuseLockedDocs()).rejects.toThrow("exit 1");
		expect(console.error).toHaveBeenCalledWith(
			expect.stringContaining("docs/page.md"),
		);
		expect(console.error).toHaveBeenCalledWith(
			expect.stringContaining("Refresh docs"),
		);
	});

	it("allows docs changes when not locked", async () => {
		mockLocked.mockResolvedValue(false);
		stage("docs/page.md");

		await expect(refuseLockedDocs()).resolves.toBeUndefined();
	});

	it("allows changes outside docs/ without checking the lock", async () => {
		stage("src/docs/a.ts");

		await expect(refuseLockedDocs()).resolves.toBeUndefined();
		expect(mockLocked).not.toHaveBeenCalled();
	});
});
