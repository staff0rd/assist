import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResolveBaseRepo = vi.fn();
vi.mock("./resolveBaseRepo", () => ({
	resolveBaseRepo: (...args: unknown[]) => mockResolveBaseRepo(...args),
}));

const mockGitSyncOrNull = vi.fn();
const mockGitSync = vi.fn();
vi.mock("../sessions/daemon/worktree/git", () => ({
	gitSyncOrNull: (...args: unknown[]) => mockGitSyncOrNull(...args),
	gitSync: (...args: unknown[]) => mockGitSync(...args),
}));

import { ensureBaseRepoRemote } from "./ensureBaseRepoRemote";

const ORIGIN = { org: "Turtlator", repo: "assist" };
const PARENT = { org: "staff0rd", repo: "assist" };
const PARENT_URL = "https://github.com/staff0rd/assist.git";

function remotes(urls: Record<string, string>): void {
	mockGitSyncOrNull.mockReturnValue(
		Object.entries(urls)
			.map(([name, url]) => `remote.${name}.url ${url}`)
			.join("\n"),
	);
}

function base(repo: typeof ORIGIN): void {
	mockResolveBaseRepo.mockReturnValue({ base: repo, origin: ORIGIN });
}

describe("ensureBaseRepoRemote", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	it("should use origin for a clone that is not a fork", () => {
		base(ORIGIN);
		remotes({
			github: "https://github.com/Turtlator/assist.git",
			origin: "https://github.com/turtlator/assist.git",
		});

		expect(ensureBaseRepoRemote("/repo")).toBe("origin");
		expect(mockGitSync).not.toHaveBeenCalled();
	});

	it("should use origin when the base repo cannot be resolved", () => {
		mockResolveBaseRepo.mockReturnValue(null);

		expect(ensureBaseRepoRemote("/repo")).toBe("origin");
		expect(mockGitSync).not.toHaveBeenCalled();
	});

	it("should use the existing remote that points at the parent", () => {
		base(PARENT);
		remotes({
			origin: "https://github.com/Turtlator/assist.git",
			source: "git@github.com:Staff0rd/assist.git",
		});

		expect(ensureBaseRepoRemote("/repo")).toBe("source");
		expect(mockGitSync).not.toHaveBeenCalled();
	});

	describe("when no remote points at the parent", () => {
		it("should add an upstream remote and report it", () => {
			base(PARENT);
			remotes({ origin: "https://github.com/Turtlator/assist.git" });

			expect(ensureBaseRepoRemote("/repo")).toBe("upstream");
			expect(mockGitSync).toHaveBeenCalledWith("/repo", [
				"remote",
				"add",
				"upstream",
				PARENT_URL,
			]);
			expect(logSpy).toHaveBeenCalledWith(
				expect.stringContaining("Added remote upstream"),
			);
		});

		it("should match origin's ssh transport", () => {
			base(PARENT);
			remotes({ origin: "git@github.com:Turtlator/assist.git" });

			ensureBaseRepoRemote("/repo");

			expect(mockGitSync).toHaveBeenCalledWith("/repo", [
				"remote",
				"add",
				"upstream",
				"git@github.com:staff0rd/assist.git",
			]);
		});

		it("should name the remote parent when upstream points elsewhere", () => {
			base(PARENT);
			remotes({
				origin: "https://github.com/Turtlator/assist.git",
				upstream: "https://github.com/someone/else.git",
			});

			expect(ensureBaseRepoRemote("/repo")).toBe("parent");
		});

		it("should throw when both names are taken", () => {
			base(PARENT);
			remotes({
				origin: "https://github.com/Turtlator/assist.git",
				upstream: "https://github.com/someone/else.git",
				parent: "https://github.com/someone/other.git",
			});

			expect(() => ensureBaseRepoRemote("/repo")).toThrow(
				`git remote add <name> ${PARENT_URL}`,
			);
			expect(mockGitSync).not.toHaveBeenCalled();
		});
	});
});
