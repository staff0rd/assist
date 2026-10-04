import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";
import { nestUnderBacklogRun } from "./nestUnderBacklogRun";

const group = { origin: "host/org/assist", clone: "/git/assist" };
const backlog = { kind: "backlog" as const, startedAt: 0 };

describe("nestUnderBacklogRun", () => {
	it("nests a session sharing a worktree cwd under the backlog run", () => {
		const sessions = [
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist-2",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup: group }),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1]] },
		]);
	});

	it("nests a child listed before its run beneath it", () => {
		const sessions = [
			makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup: group }),
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist-2",
				repoGroup: group,
				activity: backlog,
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[1], children: [sessions[0]] },
		]);
	});

	it("keeps sessions in the main clone un-nested", () => {
		const sessions = [
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({ id: "review", cwd: "/git/assist", repoGroup: group }),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("keeps sessions without a repo group un-nested", () => {
		const sessions = [
			makeSessionInfo({ id: "run", cwd: "/git/assist-2", activity: backlog }),
			makeSessionInfo({ id: "review", cwd: "/git/assist-2" }),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("leaves an orphaned child at the top level when no run shares its tree", () => {
		const sessions = [
			makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup: group }),
			makeSessionInfo({ id: "prompt", cwd: "/git/assist-3", repoGroup: group }),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("nests every non-backlog session in the tree, in their original order", () => {
		const sessions = [
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist-2",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup: group }),
			makeSessionInfo({
				id: "comments",
				cwd: "/git/assist-2",
				repoGroup: group,
			}),
			makeSessionInfo({ id: "prompt", cwd: "/git/assist-2", repoGroup: group }),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{
				session: sessions[0],
				children: [sessions[1], sessions[2], sessions[3]],
			},
		]);
	});

	it("attaches children to the first run when two runs share a tree", () => {
		const sessions = [
			makeSessionInfo({
				id: "first",
				cwd: "/git/assist-2",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({
				id: "second",
				cwd: "/git/assist-2",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup: group }),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[2]] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("nests a run launched from a clone-hosted card under that card", () => {
		const sessions = [
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({
				id: "dev",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "run",
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1]] },
		]);
	});

	it("nests under the launching card even when it is not a backlog run", () => {
		const sessions = [
			makeSessionInfo({ id: "review", cwd: "/git/assist", repoGroup: group }),
			makeSessionInfo({
				id: "dev",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "review",
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1]] },
		]);
	});

	it("keeps an unrelated session sharing the clone cwd at the top level", () => {
		const sessions = [
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({
				id: "dev",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "run",
			}),
			makeSessionInfo({
				id: "unrelated",
				cwd: "/git/assist",
				repoGroup: group,
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1]] },
			{ session: sessions[2], children: [] },
		]);
	});

	it("keeps a run with no launchedFrom at the top level", () => {
		const sessions = [
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({ id: "dev", cwd: "/git/assist", repoGroup: group }),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("keeps a run whose launching card is gone at the top level", () => {
		const sessions = [
			makeSessionInfo({
				id: "dev",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "dismissed",
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
		]);
	});

	it("nests a launched run under a card listed after it", () => {
		const sessions = [
			makeSessionInfo({
				id: "dev",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "run",
			}),
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist",
				repoGroup: group,
				activity: backlog,
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[1], children: [sessions[0]] },
		]);
	});

	it("collapses a launch chain onto the root card's row", () => {
		const sessions = [
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({
				id: "review",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "run",
			}),
			makeSessionInfo({
				id: "dev",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "review",
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1], sessions[2]] },
		]);
	});

	it("prefers the launching card over the run sharing the cwd", () => {
		const sessions = [
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist-2",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup: group }),
			makeSessionInfo({
				id: "dev",
				cwd: "/git/assist-2",
				repoGroup: group,
				launchedFrom: "review",
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1], sessions[2]] },
		]);
	});

	it("keeps both sessions at the top level when launchedFrom forms a cycle", () => {
		const sessions = [
			makeSessionInfo({
				id: "a",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "b",
			}),
			makeSessionInfo({
				id: "b",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "a",
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("nests a review and its address-comments run under the clone-hosted PR card", () => {
		const sessions = [
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({
				id: "review",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "run",
			}),
			makeSessionInfo({
				id: "comments",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "run",
			}),
			makeSessionInfo({
				id: "unrelated",
				cwd: "/git/assist",
				repoGroup: group,
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1], sessions[2]] },
			{ session: sessions[3], children: [] },
		]);
	});

	it("keeps a session in the clone at the top level when a worktree run launched it", () => {
		const sessions = [
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist-2",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({
				id: "watch",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "run",
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("keeps a launched session in place once the run that launched it is gone", () => {
		const sessions = [
			makeSessionInfo({
				id: "watch",
				cwd: "/git/assist",
				repoGroup: group,
				launchedFrom: "run",
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
		]);
	});

	it("keeps sessions in sibling worktrees on separate rows", () => {
		const sessions = [
			makeSessionInfo({
				id: "run-a",
				cwd: "/git/assist-2",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({
				id: "run-b",
				cwd: "/git/assist-3",
				repoGroup: group,
				activity: backlog,
			}),
			makeSessionInfo({
				id: "review-b",
				cwd: "/git/assist-3",
				repoGroup: group,
			}),
			makeSessionInfo({
				id: "review-a",
				cwd: "/git/assist-2",
				repoGroup: group,
			}),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[3]] },
			{ session: sessions[1], children: [sessions[2]] },
		]);
	});
});
