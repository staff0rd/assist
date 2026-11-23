import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockEnsureBaseRepoRemote = vi.fn();
vi.mock("../prs/ensureBaseRepoRemote", () => ({
	ensureBaseRepoRemote: () => mockEnsureBaseRepoRemote(),
}));

const mockResolveDefaultBranch = vi.fn();
vi.mock("./resolveDefaultBranch", () => ({
	resolveDefaultBranch: (...args: unknown[]) =>
		mockResolveDefaultBranch(...args),
}));

import { resolveBranchBase } from "./resolveBranchBase";

const mockExecFileSync = vi.mocked(execFileSync);

describe("resolveBranchBase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockResolveDefaultBranch.mockImplementation(
			(override?: string) => override ?? "main",
		);
	});

	describe("when the base repo is origin", () => {
		beforeEach(() => {
			mockEnsureBaseRepoRemote.mockReturnValue("origin");
		});

		it("should base on origin's default branch without an extra fetch", () => {
			expect(resolveBranchBase()).toEqual({
				baseRef: "origin/main",
				pushRef: undefined,
			});
			expect(mockExecFileSync).not.toHaveBeenCalled();
			expect(mockResolveDefaultBranch).toHaveBeenCalledWith(
				undefined,
				undefined,
				"origin",
			);
		});

		it("should honour the branch.defaultBranch override", () => {
			expect(resolveBranchBase("develop").baseRef).toBe("origin/develop");
		});
	});

	describe("when the base repo is the fork's parent", () => {
		beforeEach(() => {
			mockEnsureBaseRepoRemote.mockReturnValue("upstream");
		});

		it("should fetch the parent remote and base on its default branch", () => {
			expect(resolveBranchBase()).toEqual({
				baseRef: "upstream/main",
				pushRef: "origin/main",
			});
			expect(mockExecFileSync).toHaveBeenCalledWith(
				"git",
				["fetch", "upstream"],
				expect.anything(),
			);
			expect(mockResolveDefaultBranch).toHaveBeenCalledWith(
				undefined,
				undefined,
				"upstream",
			);
		});

		it("should honour the branch.defaultBranch override", () => {
			expect(resolveBranchBase("develop")).toEqual({
				baseRef: "upstream/develop",
				pushRef: "origin/develop",
			});
		});
	});
});
