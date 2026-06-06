import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRunGhGraphql = vi.fn();

vi.mock("../../shared/runGhGraphql", () => ({
	runGhGraphql: (...args: unknown[]) => mockRunGhGraphql(...args),
}));

import { fetchRepoCommitAuthors } from "./fetchRepoCommitAuthors";

const SINCE = "2026-05-07T00:00:00.000Z";

type CommitInput = { login?: string; name?: string };

function commitNode({ login, name }: CommitInput) {
	return {
		author: { user: login ? { login } : null, name: name ?? null },
	};
}

function page(
	nodes: ReturnType<typeof commitNode>[],
	pageInfo: { hasNextPage: boolean; endCursor: string | null },
) {
	return JSON.stringify({
		data: {
			repository: {
				defaultBranchRef: { target: { history: { pageInfo, nodes } } },
			},
		},
	});
}

describe("fetchRepoCommitAuthors", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("counts commits per author ordered by count", () => {
		mockRunGhGraphql.mockReturnValueOnce(
			page(
				[
					commitNode({ login: "alice" }),
					commitNode({ login: "bob" }),
					commitNode({ login: "bob" }),
				],
				{ hasNextPage: false, endCursor: null },
			),
		);

		expect(fetchRepoCommitAuthors("my-org", "alpha", SINCE)).toEqual([
			{ author: "bob", commitCount: 2 },
			{ author: "alice", commitCount: 1 },
		]);
	});

	describe("when a commit has no linked GitHub account", () => {
		it("falls back to the raw commit author name", () => {
			mockRunGhGraphql.mockReturnValueOnce(
				page([commitNode({ name: "Carol Smith" })], {
					hasNextPage: false,
					endCursor: null,
				}),
			);

			expect(fetchRepoCommitAuthors("my-org", "alpha", SINCE)).toEqual([
				{ author: "Carol Smith", commitCount: 1 },
			]);
		});
	});

	describe("when the repository has no default branch", () => {
		it("returns no authors", () => {
			mockRunGhGraphql.mockReturnValueOnce(
				JSON.stringify({ data: { repository: { defaultBranchRef: null } } }),
			);

			expect(fetchRepoCommitAuthors("my-org", "empty", SINCE)).toEqual([]);
		});
	});

	describe("when there are multiple pages", () => {
		it("passes the cursor to subsequent requests", () => {
			mockRunGhGraphql
				.mockReturnValueOnce(
					page([commitNode({ login: "alice" })], {
						hasNextPage: true,
						endCursor: "CURSOR-1",
					}),
				)
				.mockReturnValueOnce(
					page([commitNode({ login: "alice" })], {
						hasNextPage: false,
						endCursor: null,
					}),
				);

			expect(fetchRepoCommitAuthors("my-org", "alpha", SINCE)).toEqual([
				{ author: "alice", commitCount: 2 },
			]);
			expect(mockRunGhGraphql).toHaveBeenCalledTimes(2);
			expect(mockRunGhGraphql.mock.calls[0][1]).toEqual({
				org: "my-org",
				repo: "alpha",
				since: SINCE,
			});
			expect(mockRunGhGraphql.mock.calls[1][1]).toEqual({
				org: "my-org",
				repo: "alpha",
				since: SINCE,
				cursor: "CURSOR-1",
			});
		});
	});
});
