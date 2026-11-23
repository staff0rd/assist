import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResolveBaseRepo = vi.fn();
vi.mock("./resolveBaseRepo", () => ({
	resolveBaseRepo: (...args: unknown[]) => mockResolveBaseRepo(...args),
}));

const mockGitSyncOrNull = vi.fn();
vi.mock("../sessions/daemon/worktree/git", () => ({
	gitSyncOrNull: (...args: unknown[]) => mockGitSyncOrNull(...args),
}));

import { baseRepoFetchSource } from "./baseRepoFetchSource";

const ORIGIN = { org: "Turtlator", repo: "assist" };
const PARENT = { org: "staff0rd", repo: "assist" };

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

beforeEach(() => {
	vi.clearAllMocks();
});

describe("baseRepoFetchSource", () => {
	it("should use origin when the base repo is origin", () => {
		base(ORIGIN);
		remotes({
			mirror: "https://github.com/Turtlator/assist.git",
			origin: "git@github.com:Turtlator/assist.git",
		});

		expect(baseRepoFetchSource("/repo")).toBe("origin");
		expect(mockResolveBaseRepo).toHaveBeenCalledWith(undefined, "/repo");
	});

	it("should use the remote that points at the fork's parent", () => {
		base(PARENT);
		remotes({
			origin: "https://github.com/Turtlator/assist.git",
			upstream: "https://github.com/Staff0rd/assist",
		});

		expect(baseRepoFetchSource("/repo")).toBe("upstream");
	});

	describe("when no remote points at the parent", () => {
		it("should use the parent's URL over https for an https origin", () => {
			base(PARENT);
			remotes({ origin: "https://github.com/Turtlator/assist.git" });

			expect(baseRepoFetchSource("/repo")).toBe(
				"https://github.com/staff0rd/assist.git",
			);
		});

		it("should use the parent's URL over ssh for an ssh origin", () => {
			base(PARENT);
			remotes({ origin: "git@github.com:Turtlator/assist.git" });

			expect(baseRepoFetchSource("/repo")).toBe(
				"git@github.com:staff0rd/assist.git",
			);
		});
	});

	it("should fall back to origin when the base repo cannot be resolved", () => {
		mockResolveBaseRepo.mockReturnValue(null);

		expect(baseRepoFetchSource("/repo")).toBe("origin");
	});
});
