import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findRepoRoot } from "./findRepoRoot";

vi.mock("node:fs", () => ({ existsSync: vi.fn() }));

const existsSyncMock = vi.mocked(existsSync);

const filesystemRoot = path.parse(process.cwd()).root;
const nested = path.join(filesystemRoot, "work", "repo", "src");

function withGitDirAt(dir: string): void {
	existsSyncMock.mockImplementation(
		(candidate) => candidate === path.join(dir, ".git"),
	);
}

describe("findRepoRoot", () => {
	afterEach(() => {
		existsSyncMock.mockReset();
	});

	it("returns the directory that holds .git", () => {
		const repo = path.join(filesystemRoot, "work", "repo");
		withGitDirAt(repo);

		expect(findRepoRoot(repo)).toBe(repo);
	});

	it("walks up to the nearest ancestor that holds .git", () => {
		const repo = path.join(filesystemRoot, "work", "repo");
		withGitDirAt(repo);

		expect(findRepoRoot(nested)).toBe(repo);
	});

	it("finds a repo rooted at the filesystem root", () => {
		withGitDirAt(filesystemRoot);

		expect(findRepoRoot(nested)).toBe(filesystemRoot);
	});

	it("returns null when no ancestor holds .git", () => {
		existsSyncMock.mockReturnValue(false);

		expect(findRepoRoot(nested)).toBeNull();
	});
});
