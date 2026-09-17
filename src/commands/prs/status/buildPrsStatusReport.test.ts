import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetchRepoPullRequests = vi.fn();

vi.mock("./fetchRepoPullRequests", () => ({
	fetchRepoPullRequests: (...args: unknown[]) =>
		mockFetchRepoPullRequests(...args),
}));

import { buildPrsStatusReport } from "./buildPrsStatusReport";

const NOW = new Date("2026-09-18T12:00:00Z").getTime();

function pullRequest(number: number, title: string) {
	return {
		number,
		title,
		url: `https://github.com/org/repo/pull/${number}`,
		author: { login: "alice" },
		isDraft: false,
		createdAt: "2026-09-10T12:00:00Z",
		updatedAt: "2026-09-17T12:00:00Z",
		reviewDecision: "APPROVED",
		latestReviews: [],
		statusCheckRollup: [],
		mergeable: "MERGEABLE",
	};
}

describe("buildPrsStatusReport", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFetchRepoPullRequests.mockReturnValue([]);
	});

	it("groups the open pull requests by repo", () => {
		mockFetchRepoPullRequests
			.mockReturnValueOnce([pullRequest(1, "First")])
			.mockReturnValueOnce([pullRequest(2, "Second")]);

		const report = buildPrsStatusReport(["org/foo", "org/bar"], NOW);

		expect(report.errors).toEqual([]);
		expect(report.repos.map((repo) => repo.repo)).toEqual([
			"org/foo",
			"org/bar",
		]);
		expect(report.repos[0].pullRequests[0]).toMatchObject({
			number: 1,
			title: "First",
			age: "1d",
		});
		expect(mockFetchRepoPullRequests.mock.calls).toEqual([
			["org", "foo"],
			["org", "bar"],
		]);
	});

	it("reports a repo with no open pull requests", () => {
		expect(buildPrsStatusReport(["org/quiet"], NOW)).toEqual({
			repos: [{ repo: "org/quiet", pullRequests: [] }],
			errors: [],
		});
	});

	describe("when an argument is not owner/repo", () => {
		it("records an error without calling gh", () => {
			const report = buildPrsStatusReport(["not-a-repo"], NOW);

			expect(report.errors).toEqual([
				{ repo: "not-a-repo", error: "not an owner/repo argument" },
			]);
			expect(mockFetchRepoPullRequests).not.toHaveBeenCalled();
		});
	});

	describe("when a repo cannot be read", () => {
		it("records the error beside the repos that succeeded", () => {
			mockFetchRepoPullRequests
				.mockImplementationOnce(() => {
					const error = new Error("gh exited with code 1");
					Object.assign(error, {
						stderr: "could not resolve to a Repository with the name\n",
					});
					throw error;
				})
				.mockReturnValueOnce([pullRequest(7, "Works")]);

			const report = buildPrsStatusReport(["org/missing", "org/good"], NOW);

			expect(report.errors).toEqual([
				{
					repo: "org/missing",
					error: "could not resolve to a Repository with the name",
				},
			]);
			expect(report.repos).toHaveLength(1);
			expect(report.repos[0].repo).toBe("org/good");
		});
	});
});
