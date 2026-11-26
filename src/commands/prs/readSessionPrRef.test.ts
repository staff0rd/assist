import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentBranch = vi.fn();
const mockViewCurrentPr = vi.fn();
vi.mock("./shared", () => ({
	getCurrentBranch: () => mockGetCurrentBranch(),
	viewCurrentPr: (...args: unknown[]) => mockViewCurrentPr(...args),
}));

import { readSessionPrRef } from "./readSessionPrRef";

describe("readSessionPrRef", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetCurrentBranch.mockReturnValue("feature");
	});

	it("reads the current branch PR into a git ref", () => {
		mockViewCurrentPr.mockReturnValue({
			number: 42,
			title: "Add login",
			url: "https://github.com/acme/widgets/pull/42",
			state: "OPEN",
		});

		expect(readSessionPrRef()).toEqual({
			kind: "pr",
			ref: "42",
			title: "Add login",
			url: "https://github.com/acme/widgets/pull/42",
			state: "OPEN",
		});
		expect(mockViewCurrentPr).toHaveBeenCalledWith(
			"number,title,url,state",
			undefined,
		);
	});

	it("looks the PR up with a one-off base repo choice", () => {
		mockViewCurrentPr.mockReturnValue({ number: 42 });

		expect(readSessionPrRef("origin")).toEqual({ kind: "pr", ref: "42" });
		expect(mockViewCurrentPr).toHaveBeenCalledWith(
			"number,title,url,state",
			"origin",
		);
	});

	it("returns null on a detached HEAD", () => {
		mockGetCurrentBranch.mockReturnValue("HEAD");

		expect(readSessionPrRef()).toBeNull();
		expect(mockViewCurrentPr).not.toHaveBeenCalled();
	});

	it("returns null when gh finds no PR", () => {
		mockViewCurrentPr.mockImplementation(() => {
			throw new Error("no pull requests found");
		});

		expect(readSessionPrRef()).toBeNull();
	});
});
