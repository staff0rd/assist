import { describe, expect, it } from "vitest";
import { nestUnderBacklogRun } from "./nestUnderBacklogRun";
import type { SessionInfo } from "../../../../../types";

const group = { origin: "host/org/assist", clone: "/git/assist" };

function session(id: string, cwd: string): SessionInfo {
	return {
		id,
		name: id,
		commandType: "assist",
		status: "running",
		startedAt: 0,
		cwd,
		repoGroup: group,
	};
}

function run(id: string, cwd: string): SessionInfo {
	return {
		...session(id, cwd),
		activity: { kind: "backlog", startedAt: 0 },
	};
}

describe("nestUnderBacklogRun", () => {
	it("nests a session sharing a worktree cwd under the backlog run", () => {
		const sessions = [
			run("run", "/git/assist-2"),
			session("review", "/git/assist-2"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1]] },
		]);
	});

	it("nests a child listed before its run beneath it", () => {
		const sessions = [
			session("review", "/git/assist-2"),
			run("run", "/git/assist-2"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[1], children: [sessions[0]] },
		]);
	});

	it("keeps sessions in the main clone un-nested", () => {
		const sessions = [
			run("run", "/git/assist"),
			session("review", "/git/assist"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("keeps sessions without a repo group un-nested", () => {
		const sessions = [
			{ ...run("run", "/git/assist-2"), repoGroup: undefined },
			{ ...session("review", "/git/assist-2"), repoGroup: undefined },
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("leaves an orphaned child at the top level when no run shares its tree", () => {
		const sessions = [
			session("review", "/git/assist-2"),
			session("prompt", "/git/assist-3"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("nests every non-backlog session in the tree, in their original order", () => {
		const sessions = [
			run("run", "/git/assist-2"),
			session("review", "/git/assist-2"),
			session("comments", "/git/assist-2"),
			session("prompt", "/git/assist-2"),
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
			run("first", "/git/assist-2"),
			run("second", "/git/assist-2"),
			session("review", "/git/assist-2"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[2]] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("nests a run launched from a clone-hosted card under that card", () => {
		const sessions = [
			run("run", "/git/assist"),
			{ ...session("dev", "/git/assist"), launchedFrom: "run" },
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1]] },
		]);
	});

	it("nests under the launching card even when it is not a backlog run", () => {
		const sessions = [
			session("review", "/git/assist"),
			{ ...session("dev", "/git/assist"), launchedFrom: "review" },
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1]] },
		]);
	});

	it("keeps an unrelated session sharing the clone cwd at the top level", () => {
		const sessions = [
			run("run", "/git/assist"),
			{ ...session("dev", "/git/assist"), launchedFrom: "run" },
			session("unrelated", "/git/assist"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1]] },
			{ session: sessions[2], children: [] },
		]);
	});

	it("keeps a run with no launchedFrom at the top level", () => {
		const sessions = [run("run", "/git/assist"), session("dev", "/git/assist")];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("keeps a run whose launching card is gone at the top level", () => {
		const sessions = [
			{ ...session("dev", "/git/assist"), launchedFrom: "dismissed" },
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
		]);
	});

	it("nests a launched run under a card listed after it", () => {
		const sessions = [
			{ ...session("dev", "/git/assist"), launchedFrom: "run" },
			run("run", "/git/assist"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[1], children: [sessions[0]] },
		]);
	});

	it("collapses a launch chain onto the root card's row", () => {
		const sessions = [
			run("run", "/git/assist"),
			{ ...session("review", "/git/assist"), launchedFrom: "run" },
			{ ...session("dev", "/git/assist"), launchedFrom: "review" },
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1], sessions[2]] },
		]);
	});

	it("prefers the launching card over the run sharing the cwd", () => {
		const sessions = [
			run("run", "/git/assist-2"),
			session("review", "/git/assist-2"),
			{ ...session("dev", "/git/assist-2"), launchedFrom: "review" },
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1], sessions[2]] },
		]);
	});

	it("keeps both sessions at the top level when launchedFrom forms a cycle", () => {
		const sessions = [
			{ ...session("a", "/git/assist"), launchedFrom: "b" },
			{ ...session("b", "/git/assist"), launchedFrom: "a" },
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("nests a review and its address-comments run under the clone-hosted PR card", () => {
		const sessions = [
			run("run", "/git/assist"),
			{ ...session("review", "/git/assist"), launchedFrom: "run" },
			{ ...session("comments", "/git/assist"), launchedFrom: "run" },
			session("unrelated", "/git/assist"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[1], sessions[2]] },
			{ session: sessions[3], children: [] },
		]);
	});

	it("keeps a watcher in the clone at the top level when a worktree run launched it", () => {
		const sessions = [
			run("run", "/git/assist-2"),
			{ ...session("watch", "/git/assist"), launchedFrom: "run" },
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
			{ session: sessions[1], children: [] },
		]);
	});

	it("keeps the watcher in place once the run that launched it is gone", () => {
		const sessions = [
			{ ...session("watch", "/git/assist"), launchedFrom: "run" },
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [] },
		]);
	});

	it("keeps sessions in sibling worktrees on separate rows", () => {
		const sessions = [
			run("run-a", "/git/assist-2"),
			run("run-b", "/git/assist-3"),
			session("review-b", "/git/assist-3"),
			session("review-a", "/git/assist-2"),
		];

		expect(nestUnderBacklogRun(sessions)).toEqual([
			{ session: sessions[0], children: [sessions[3]] },
			{ session: sessions[1], children: [sessions[2]] },
		]);
	});
});
