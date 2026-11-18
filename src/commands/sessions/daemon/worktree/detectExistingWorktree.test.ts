import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

describe("detectExistingWorktree", () => {
	beforeEach(() => vi.clearAllMocks());

	it("does not bind the main clone when git prints it with forward slashes", () => {
		mainMock.mockReturnValue(asGitPrintsIt(clone));
		expect(detectExistingWorktree(clone)).toBeUndefined();
	});

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
