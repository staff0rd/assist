import { describe, expect, it } from "vitest";
import type { SessionInfo } from "../types";
import { groupSessionsByStatus } from "./groupSessionsByStatus";

function session(
	id: string,
	status: SessionInfo["status"],
	extra: Partial<SessionInfo> = {},
): SessionInfo {
	return {
		id,
		name: id,
		status,
		commandType: "claude",
		startedAt: 0,
		...extra,
	};
}

const ids = (list: SessionInfo[]) => list.map((s) => s.id);

describe("groupSessionsByStatus", () => {
	it("puts waiting and error sessions in Needs you", () => {
		const groups = groupSessionsByStatus([
			session("a", "running"),
			session("b", "waiting"),
			session("c", "error"),
			session("d", "done"),
			session("e", "stopped"),
		]);

		expect(ids(groups.needsYou)).toEqual(["b", "c"]);
		expect(ids(groups.running)).toEqual(["a"]);
		expect(ids(groups.done)).toEqual(["d", "e"]);
	});

	it("treats a running session with a blocking preview as needing you", () => {
		const groups = groupSessionsByStatus([
			session("a", "running", {
				pendingPrPreview: {
					requestId: "r",
					title: "PR",
					body: "",
					prNumber: 1,
					kind: "pr",
				},
			}),
		]);

		expect(ids(groups.needsYou)).toEqual(["a"]);
	});

	it("puts a session waiting on a check in Needs you", () => {
		const groups = groupSessionsByStatus([
			session("a", "running", {
				pendingPrPreview: {
					requestId: "r",
					title: "Check",
					body: "",
					prNumber: null,
					kind: "check",
				},
			}),
		]);

		expect(ids(groups.needsYou)).toEqual(["a"]);
		expect(ids(groups.done)).toEqual([]);
	});

	it("puts a session waiting on a question in Answer here", () => {
		const groups = groupSessionsByStatus([
			session("a", "running", {
				pendingPrPreview: {
					requestId: "r",
					title: "Question",
					body: "",
					prNumber: null,
					kind: "question",
				},
			}),
			session("b", "running"),
			session("c", "waiting"),
		]);

		expect(ids(groups.questions)).toEqual(["a"]);
		expect(ids(groups.needsYou)).toEqual(["c"]);
		expect(ids(groups.running)).toEqual(["b"]);
	});

	it("puts a session waiting on a backlog-item preview in Answer here", () => {
		const groups = groupSessionsByStatus([
			session("a", "waiting", {
				pendingPrPreview: {
					requestId: "r",
					title: "Backlog item",
					body: "",
					prNumber: null,
					kind: "backlog-item",
				},
			}),
		]);

		expect(ids(groups.questions)).toEqual(["a"]);
		expect(ids(groups.needsYou)).toEqual([]);
	});

	it("puts a session waiting on a github-issue preview in Answer here", () => {
		const groups = groupSessionsByStatus([
			session("a", "running", {
				pendingPrPreview: {
					requestId: "r",
					title: "Issue",
					body: "",
					prNumber: null,
					kind: "github-issue",
				},
			}),
		]);

		expect(ids(groups.questions)).toEqual(["a"]);
		expect(ids(groups.needsYou)).toEqual([]);
	});

	it("puts non-done review-phase sessions in Review ahead of their status", () => {
		const review = {
			activity: {
				kind: "backlog" as const,
				itemId: 1,
				startedAt: 0,
				phase: 2,
				totalPhases: 2,
			},
		};
		const groups = groupSessionsByStatus([
			session("a", "running", review),
			session("b", "waiting", review),
			session("c", "running", {
				...review,
				pendingPrPreview: {
					requestId: "r",
					title: "Question",
					body: "",
					prNumber: null,
					kind: "question",
				},
			}),
			session("d", "done", review),
			session("e", "running", {
				activity: { ...review.activity, phase: 1 },
			}),
		]);

		expect(ids(groups.review)).toEqual(["a", "b", "c"]);
		expect(ids(groups.questions)).toEqual([]);
		expect(ids(groups.needsYou)).toEqual([]);
		expect(ids(groups.running)).toEqual(["e"]);
		expect(ids(groups.done)).toEqual(["d"]);
	});
});
