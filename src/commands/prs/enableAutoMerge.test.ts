import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";

const mockExecFileSync = vi.mocked(execFileSync);
vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockGetCurrentBranch = vi.fn();
const mockGetBaseRepoInfo = vi.fn();
vi.mock("./shared", () => ({
	getCurrentBranch: () => mockGetCurrentBranch(),
}));
vi.mock("./getBaseRepoInfo", () => ({
	getBaseRepoInfo: (...args: unknown[]) => mockGetBaseRepoInfo(...args),
}));

const mockCurrentPrSelector = vi.fn();
vi.mock("./currentPrSelector", () => ({
	currentPrSelector: (...args: unknown[]) => mockCurrentPrSelector(...args),
}));

import { enableAutoMerge } from "./enableAutoMerge";

beforeEach(() => {
	vi.clearAllMocks();
	mockGetCurrentBranch.mockReturnValue("feat/x");
	mockGetBaseRepoInfo.mockReturnValue({ org: "acme", repo: "widgets" });
	mockCurrentPrSelector.mockImplementation((branch: string) => branch);
});

describe("enableAutoMerge", () => {
	it("squash-merges the current branch's PR on auto-merge", () => {
		enableAutoMerge();

		expect(mockExecFileSync).toHaveBeenCalledWith(
			"gh",
			["pr", "merge", "feat/x", "--auto", "--squash", "-R", "acme/widgets"],
			{ stdio: "inherit" },
		);
	});

	it("targets the fork branch's PR in the parent repo", () => {
		mockGetBaseRepoInfo.mockReturnValue({ org: "upstream", repo: "widgets" });
		mockCurrentPrSelector.mockReturnValue("acme:feat/x");

		enableAutoMerge();

		expect(mockCurrentPrSelector).toHaveBeenCalledWith("feat/x", "upstream");
		expect(mockExecFileSync).toHaveBeenCalledWith(
			"gh",
			[
				"pr",
				"merge",
				"acme:feat/x",
				"--auto",
				"--squash",
				"-R",
				"upstream/widgets",
			],
			{ stdio: "inherit" },
		);
	});

	it("resolves the repo with a one-off base repo choice", () => {
		enableAutoMerge("origin");

		expect(mockGetBaseRepoInfo).toHaveBeenCalledWith("origin");
	});

	it("warns and returns when the repo refuses auto-merge", () => {
		const error = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);
		mockExecFileSync.mockImplementation(() => {
			throw new Error("Auto-merge is not allowed for this repository");
		});

		expect(() => enableAutoMerge()).not.toThrow();

		expect(error.mock.calls[0][0]).toContain(
			"Warning: could not enable auto-merge",
		);
		error.mockRestore();
	});

	it("warns when the branch cannot be resolved", () => {
		const error = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);
		mockGetCurrentBranch.mockImplementation(() => {
			throw new Error("not a git repository");
		});

		expect(() => enableAutoMerge()).not.toThrow();

		expect(error.mock.calls[0][0]).toContain("not a git repository");
		error.mockRestore();
	});
});
