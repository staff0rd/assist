import { afterEach, describe, expect, it, vi } from "vitest";

const runGhGraphql = vi.fn();
vi.mock("../../shared/runGhGraphql", () => ({
	runGhGraphql: (...args: unknown[]) => runGhGraphql(...args),
}));
vi.mock("./shared", () => ({
	getCurrentPrNodeId: () => "PR_node",
	isGhNotInstalled: () => false,
}));

import { comment } from "./comment";

afterEach(() => {
	runGhGraphql.mockReset();
	vi.restoreAllMocks();
});

describe("comment thread verification", () => {
	it("throws when GitHub returns no thread id", () => {
		runGhGraphql.mockReturnValue(
			JSON.stringify({
				data: { addPullRequestReviewThread: { thread: null } },
			}),
		);
		expect(() => comment("src/foo.ts", 42, "body")).toThrow(
			/did not create a review thread/,
		);
	});

	it("succeeds when GitHub returns a thread id", () => {
		runGhGraphql.mockReturnValue(
			JSON.stringify({
				data: { addPullRequestReviewThread: { thread: { id: "T_1" } } },
			}),
		);
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		expect(() => comment("src/foo.ts", 42, "body")).not.toThrow();
		expect(log).toHaveBeenCalledWith("Added review comment on src/foo.ts:42");
	});
});
