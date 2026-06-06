import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRunGhGraphql = vi.fn();

vi.mock("../../shared/runGhGraphql", () => ({
	runGhGraphql: (...args: unknown[]) => mockRunGhGraphql(...args),
}));

import { fetchOrgRepoCommitCounts } from "./fetchOrgRepoCommitCounts";

const SINCE = "2026-05-07T00:00:00.000Z";

type NodeInput = {
	name: string;
	pushedAt?: string;
	commitCount?: number;
	emptyRepo?: boolean;
};

function repoNode({ name, pushedAt, commitCount, emptyRepo }: NodeInput) {
	return {
		name,
		pushedAt: pushedAt ?? "2026-06-01T00:00:00Z",
		defaultBranchRef: emptyRepo
			? null
			: { target: { history: { totalCount: commitCount ?? 0 } } },
	};
}

function page(
	nodes: ReturnType<typeof repoNode>[],
	pageInfo: { hasNextPage: boolean; endCursor: string | null },
) {
	return JSON.stringify({
		data: { organization: { repositories: { pageInfo, nodes } } },
	});
}

describe("fetchOrgRepoCommitCounts", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns commit counts per repo", () => {
		mockRunGhGraphql.mockReturnValueOnce(
			page(
				[
					repoNode({ name: "alpha", commitCount: 12 }),
					repoNode({ name: "beta", commitCount: 3 }),
				],
				{ hasNextPage: false, endCursor: null },
			),
		);

		expect(fetchOrgRepoCommitCounts("my-org", SINCE)).toEqual([
			{ name: "alpha", commitCount: 12 },
			{ name: "beta", commitCount: 3 },
		]);
	});

	it("skips repos without a default branch", () => {
		mockRunGhGraphql.mockReturnValueOnce(
			page(
				[
					repoNode({ name: "alpha", commitCount: 12 }),
					repoNode({ name: "empty", emptyRepo: true }),
				],
				{ hasNextPage: false, endCursor: null },
			),
		);

		expect(fetchOrgRepoCommitCounts("my-org", SINCE)).toEqual([
			{ name: "alpha", commitCount: 12 },
		]);
	});

	describe("when the organisation is not found", () => {
		it("throws", () => {
			mockRunGhGraphql.mockReturnValueOnce(
				JSON.stringify({ data: { organization: null } }),
			);

			expect(() => fetchOrgRepoCommitCounts("nope", SINCE)).toThrow(
				"Organisation not found: nope",
			);
		});
	});

	describe("when there are multiple pages", () => {
		it("passes the cursor to subsequent requests", () => {
			mockRunGhGraphql
				.mockReturnValueOnce(
					page([repoNode({ name: "alpha", commitCount: 5 })], {
						hasNextPage: true,
						endCursor: "CURSOR-1",
					}),
				)
				.mockReturnValueOnce(
					page([repoNode({ name: "beta", commitCount: 2 })], {
						hasNextPage: false,
						endCursor: null,
					}),
				);

			expect(fetchOrgRepoCommitCounts("my-org", SINCE)).toEqual([
				{ name: "alpha", commitCount: 5 },
				{ name: "beta", commitCount: 2 },
			]);
			expect(mockRunGhGraphql).toHaveBeenCalledTimes(2);
			expect(mockRunGhGraphql.mock.calls[0][1]).toEqual({
				org: "my-org",
				since: SINCE,
			});
			expect(mockRunGhGraphql.mock.calls[1][1]).toEqual({
				org: "my-org",
				since: SINCE,
				cursor: "CURSOR-1",
			});
		});
	});

	describe("when a page ends with a repo last pushed before the window", () => {
		it("stops paging", () => {
			mockRunGhGraphql.mockReturnValueOnce(
				page(
					[
						repoNode({ name: "alpha", commitCount: 5 }),
						repoNode({
							name: "stale",
							pushedAt: "2026-01-01T00:00:00Z",
							commitCount: 0,
						}),
					],
					{ hasNextPage: true, endCursor: "CURSOR-1" },
				),
			);

			fetchOrgRepoCommitCounts("my-org", SINCE);

			expect(mockRunGhGraphql).toHaveBeenCalledTimes(1);
		});
	});
});
