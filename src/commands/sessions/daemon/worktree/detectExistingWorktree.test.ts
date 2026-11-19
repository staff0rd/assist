import { existsSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { detectExistingWorktree } from "./detectExistingWorktree";
import { mainWorktree } from "./listWorktreePaths";

vi.mock("../../../../shared/findRepoRoot", () => ({
	findRepoRoot: (cwd: string) => cwd,
}));
vi.mock("./listWorktreePaths", () => ({ mainWorktree: vi.fn() }));
vi.mock("./worktreeConfigFor", () => ({
	worktreeConfigFor: () => ({ enabled: true }),
}));

const mainMock = vi.mocked(mainWorktree);
const clone = resolve("/git/repo");
const asGitPrintsIt = (path: string) => path.replaceAll("\\", "/");

const realClone = realpathSync.native(
	mkdtempSync(join(tmpdir(), "detect-worktree-")),
);
const recased = realClone.toUpperCase();
const caseInsensitive = recased !== realClone && existsSync(recased);

describe("detectExistingWorktree", () => {
	beforeEach(() => vi.clearAllMocks());
	afterAll(() => rmSync(realClone, { recursive: true, force: true }));

	it.runIf(process.platform === "win32")(
		"does not bind the main clone when git prints it with forward slashes",
		() => {
			mainMock.mockReturnValue(asGitPrintsIt(clone));
			expect(detectExistingWorktree(clone)).toBeUndefined();
		},
	);

	it.runIf(caseInsensitive)(
		"does not bind the main clone when its casing differs from git's",
		() => {
			mainMock.mockReturnValue(realClone);
			expect(detectExistingWorktree(recased)).toBeUndefined();
		},
	);

	it("does not bind the main clone when git prints an equivalent spelling of it", () => {
		mainMock.mockReturnValue(`${clone}/../repo`);
		expect(detectExistingWorktree(clone)).toBeUndefined();
	});

	it("binds a linked worktree to its clone", () => {
		mainMock.mockReturnValue(asGitPrintsIt(clone));
		const linked = resolve("/git/repo-2");
		expect(detectExistingWorktree(linked)).toEqual({ path: linked, clone });
	});

	it("binds nothing outside a git repo", () => {
		mainMock.mockReturnValue(null);
		expect(detectExistingWorktree(clone)).toBeUndefined();
	});
});
