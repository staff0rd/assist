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
vi.mock("./shared", () => ({
	getCurrentBranch: () => mockGetCurrentBranch(),
}));

import { enableAutoMerge } from "./enableAutoMerge";

beforeEach(() => {
	vi.clearAllMocks();
	mockGetCurrentBranch.mockReturnValue("feat/x");
});

describe("enableAutoMerge", () => {
	it("squash-merges the current branch's PR on auto-merge", () => {
		enableAutoMerge();

		expect(mockExecFileSync).toHaveBeenCalledWith(
			"gh",
			["pr", "merge", "feat/x", "--auto", "--squash"],
			{ stdio: "inherit" },
		);
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
