import { beforeEach, describe, expect, it, vi } from "vitest";
import { branchDiffBase } from "./branchDiffBase";
import { itemScopeCommits } from "./itemScopeCommits";
import { resolveDiffScope } from "./resolveDiffScope";

vi.mock("./itemScopeCommits", () => ({ itemScopeCommits: vi.fn() }));
vi.mock("./branchDiffBase", () => ({ branchDiffBase: vi.fn() }));

const itemScopeCommitsMock = vi.mocked(itemScopeCommits);
const branchDiffBaseMock = vi.mocked(branchDiffBase);

describe("resolveDiffScope", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		itemScopeCommitsMock.mockResolvedValue([{ sha: "one" }, { sha: "two" }]);
		branchDiffBaseMock.mockResolvedValue("base-sha");
	});

	it("defaults to the whole item when no scope is given", async () => {
		expect(
			await resolveDiffScope("/repo", { conversationId: "sess-1" }, undefined),
		).toEqual({
			kind: "all",
		});
		expect(itemScopeCommitsMock).not.toHaveBeenCalled();
	});

	it("accepts the all scope without consulting the item", async () => {
		expect(
			await resolveDiffScope("/repo", { conversationId: "sess-1" }, "all"),
		).toEqual({
			kind: "all",
		});
		expect(itemScopeCommitsMock).not.toHaveBeenCalled();
	});

	it("accepts the uncommitted scope without consulting the item", async () => {
		expect(
			await resolveDiffScope(
				"/repo",
				{ conversationId: "sess-1" },
				"uncommitted",
			),
		).toEqual({
			kind: "uncommitted",
		});
		expect(itemScopeCommitsMock).not.toHaveBeenCalled();
	});

	it("resolves the branch scope to its merge base", async () => {
		expect(
			await resolveDiffScope("/repo", { conversationId: "sess-1" }, "branch"),
		).toEqual({
			kind: "branch",
			base: "base-sha",
		});
		expect(branchDiffBaseMock).toHaveBeenCalledWith("/repo");
		expect(itemScopeCommitsMock).not.toHaveBeenCalled();
	});

	it("rejects the branch scope when no base resolves", async () => {
		branchDiffBaseMock.mockResolvedValue(undefined);

		expect(
			await resolveDiffScope("/repo", { conversationId: "sess-1" }, "branch"),
		).toBeUndefined();
	});

	it("accepts a sha the item recorded", async () => {
		expect(
			await resolveDiffScope("/repo", { conversationId: "sess-1" }, "two"),
		).toEqual({
			kind: "commit",
			sha: "two",
		});
	});

	it("rejects a sha the item did not record", async () => {
		expect(
			await resolveDiffScope("/repo", { conversationId: "sess-1" }, "deadbeef"),
		).toBeUndefined();
	});

	it("rejects a sha when the session maps to no recorded commits", async () => {
		itemScopeCommitsMock.mockResolvedValue([]);

		expect(await resolveDiffScope("/repo", undefined, "one")).toBeUndefined();
	});
});
