import { describe, expect, it } from "vitest";
import { groupSessionsByRepo } from "./groupSessionsByRepo";
import { hasWaitedPastThreshold } from "./sortSessionsByWaiting";
import type { SessionInfo } from "./types";

const NOW = 1_000_000;

function session(id: string, cwd?: string): SessionInfo {
	return {
		id,
		name: id,
		commandType: "run",
		status: "running",
		startedAt: 0,
		cwd,
	};
}

function waiting(id: string, cwd: string, waitingForMs: number): SessionInfo {
	return {
		...session(id, cwd),
		status: "waiting",
		waitingSince: NOW - waitingForMs,
	};
}

function waitedPast(thresholdMs: number): (session: SessionInfo) => boolean {
	return (session) => hasWaitedPastThreshold(session, NOW, thresholdMs);
}

function row(session: SessionInfo, ...children: SessionInfo[]) {
	return { session, children };
}

const repoGroup = { origin: "host/org/assist", clone: "/git/assist" };

function inWorktree(id: string, cwd: string): SessionInfo {
	return { ...session(id, cwd), repoGroup };
}

function watcher(id: string, cwd: string): SessionInfo {
	return { ...session(id, cwd), watcher: true };
}

function backlogRun(id: string, cwd: string): SessionInfo {
	return {
		...inWorktree(id, cwd),
		activity: { kind: "backlog", startedAt: 0 },
	};
}

describe("groupSessionsByRepo", () => {
	it("groups 2+ sessions sharing a cwd under a repo entry", () => {
		const sessions = [
			session("a", "/home/me/git/assist"),
			session("b", "/home/me/git/assist"),
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/home/me/git/assist",
				label: "assist",
				rows: [row(sessions[0]), row(sessions[1])],
			},
		]);
	});

	it("renders a repo with a single session as a standalone card", () => {
		const sessions = [session("a", "/home/me/git/assist")];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([{ kind: "single", session: sessions[0] }]);
	});

	it("pins starred sessions above non-starred within a group", () => {
		const sessions = [
			session("a", "/repo"),
			session("b", "/repo"),
			session("c", "/repo"),
		];
		const starred = new Set(["c"]);

		const groups = groupSessionsByRepo(sessions, (s) => starred.has(s.id));

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/repo",
				label: "repo",
				rows: [row(sessions[2]), row(sessions[0]), row(sessions[1])],
			},
		]);
	});

	it("pins a watcher above the rest of its group", () => {
		const sessions = [
			session("a", "/repo"),
			session("b", "/repo"),
			watcher("w", "/repo"),
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/repo",
				label: "repo",
				rows: [row(sessions[2]!), row(sessions[0]!), row(sessions[1]!)],
			},
		]);
	});

	it("keeps a starred member above the group's watcher", () => {
		const sessions = [
			watcher("w", "/repo"),
			session("a", "/repo"),
			session("b", "/repo"),
		];
		const starred = new Set(["b"]);

		const groups = groupSessionsByRepo(sessions, (s) => starred.has(s.id));

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/repo",
				label: "repo",
				rows: [row(sessions[2]!), row(sessions[0]!), row(sessions[1]!)],
			},
		]);
	});

	it("keeps a watcher above a waiting member of its group", () => {
		const sessions = [
			session("a", "/repo"),
			session("b", "/repo"),
			watcher("w", "/repo"),
		];
		const waiting = new Set(["b"]);

		const groups = groupSessionsByRepo(
			sessions,
			() => false,
			(s) => waiting.has(s.id),
		);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/repo",
				label: "repo",
				rows: [row(sessions[2]!), row(sessions[1]!), row(sessions[0]!)],
			},
		]);
	});

	it("leaves a group holding only an unstarred watcher where it is", () => {
		const sessions = [
			session("a", "/one"),
			session("b", "/one"),
			session("c", "/two"),
			watcher("w", "/two"),
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(
			groups.map((g) => (g.kind === "repo" ? g.key : g.session.id)),
		).toEqual(["/one", "/two"]);
	});

	it("floats the watcher's group once the watcher is starred", () => {
		const sessions = [
			session("a", "/one"),
			session("b", "/one"),
			session("c", "/two"),
			watcher("w", "/two"),
		];
		const starred = new Set(["w"]);

		const groups = groupSessionsByRepo(sessions, (s) => starred.has(s.id));

		expect(
			groups.map((g) => (g.kind === "repo" ? g.key : g.session.id)),
		).toEqual(["/two", "/one"]);
	});

	it("orders groups by each repo's first appearance", () => {
		const sessions = [
			session("a", "/one"),
			session("b", "/two"),
			session("c", "/one"),
			session("d", "/two"),
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(
			groups.map((g) => (g.kind === "repo" ? g.key : g.session.id)),
		).toEqual(["/one", "/two"]);
	});

	it("keeps no-cwd sessions as separate standalone cards", () => {
		const sessions = [session("a"), session("b")];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([
			{ kind: "single", session: sessions[0] },
			{ kind: "single", session: sessions[1] },
		]);
	});

	it("groups a clone and its worktrees under one entry named after the clone", () => {
		const group = { origin: "host/org/assist", clone: "/git/assist" };
		const sessions = [
			{ ...session("a", "/git/assist"), repoGroup: group },
			{ ...session("b", "/git/assist-2"), repoGroup: group },
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "host/org/assist",
				label: "assist",
				rows: [row(sessions[0]), row(sessions[1])],
			},
		]);
	});

	it("keeps clones of different repos apart even in the same directory tree", () => {
		const sessions = [
			{
				...session("a", "/git/assist"),
				repoGroup: { origin: "host/org/assist", clone: "/git/assist" },
			},
			{
				...session("b", "/git/other"),
				repoGroup: { origin: "host/org/other", clone: "/git/other" },
			},
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([
			{ kind: "single", session: sessions[0] },
			{ kind: "single", session: sessions[1] },
		]);
	});

	it("floats the waiting member to the top of its group", () => {
		const sessions = [
			session("a", "/repo"),
			session("b", "/repo"),
			session("c", "/repo"),
		];
		const waiting = new Set(["c"]);

		const groups = groupSessionsByRepo(
			sessions,
			() => false,
			(s) => waiting.has(s.id),
		);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/repo",
				label: "repo",
				rows: [row(sessions[2]), row(sessions[0]), row(sessions[1])],
			},
		]);
	});

	it("keeps a starred member above a waiting one inside a group", () => {
		const sessions = [
			session("a", "/repo"),
			session("b", "/repo"),
			session("c", "/repo"),
		];
		const starred = new Set(["b"]);
		const waiting = new Set(["c"]);

		const groups = groupSessionsByRepo(
			sessions,
			(s) => starred.has(s.id),
			(s) => waiting.has(s.id),
		);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/repo",
				label: "repo",
				rows: [row(sessions[1]), row(sessions[2]), row(sessions[0])],
			},
		]);
	});

	it("floats a whole group above the rest when one member is waiting", () => {
		const sessions = [
			session("a", "/one"),
			session("b", "/one"),
			session("c", "/two"),
			session("d", "/two"),
		];
		const waiting = new Set(["d"]);

		const groups = groupSessionsByRepo(
			sessions,
			() => false,
			(s) => waiting.has(s.id),
		);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/two",
				label: "two",
				rows: [row(sessions[3]), row(sessions[2])],
			},
			{
				kind: "repo",
				key: "/one",
				label: "one",
				rows: [row(sessions[0]), row(sessions[1])],
			},
		]);
	});

	it("keeps a group with a starred member above a group with a waiting one", () => {
		const sessions = [
			session("a", "/one"),
			session("b", "/one"),
			session("c", "/two"),
			session("d", "/two"),
		];
		const starred = new Set(["b"]);
		const waiting = new Set(["c"]);

		const groups = groupSessionsByRepo(
			sessions,
			(s) => starred.has(s.id),
			(s) => waiting.has(s.id),
		);

		expect(
			groups.map((g) => (g.kind === "repo" ? g.key : g.session.id)),
		).toEqual(["/one", "/two"]);
	});

	it("floats a waiting standalone session above a group with none", () => {
		const sessions = [
			session("a", "/one"),
			session("b", "/one"),
			session("c", "/two"),
		];
		const waiting = new Set(["c"]);

		const groups = groupSessionsByRepo(
			sessions,
			() => false,
			(s) => waiting.has(s.id),
		);

		expect(groups).toEqual([
			{ kind: "single", session: sessions[2] },
			{
				kind: "repo",
				key: "/one",
				label: "one",
				rows: [row(sessions[0]), row(sessions[1])],
			},
		]);
	});

	it("keeps floated groups in the order their waiters were given, longest waiting first", () => {
		const sessions = [
			session("longest", "/two"),
			session("shorter", "/one"),
			session("idle", "/one"),
			session("other", "/two"),
		];
		const waiting = new Set(["longest", "shorter"]);

		const groups = groupSessionsByRepo(
			sessions,
			() => false,
			(s) => waiting.has(s.id),
		);

		expect(
			groups.map((g) => (g.kind === "repo" ? g.key : g.session.id)),
		).toEqual(["/two", "/one"]);
	});

	it("never splits a group, even when only one member is waiting", () => {
		const sessions = [
			session("a", "/one"),
			session("b", "/one"),
			session("c", "/two"),
			session("d", "/two"),
		];
		const waiting = new Set(["b"]);

		const groups = groupSessionsByRepo(
			sessions,
			() => false,
			(s) => waiting.has(s.id),
		);

		expect(groups).toHaveLength(2);
		expect(groups[0]).toEqual({
			kind: "repo",
			key: "/one",
			label: "one",
			rows: [row(sessions[1]), row(sessions[0])],
		});
	});

	it("leaves the order untouched when no waiting predicate is given", () => {
		const sessions = [
			session("a", "/one"),
			session("b", "/one"),
			session("c", "/two"),
			session("d", "/two"),
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/one",
				label: "one",
				rows: [row(sessions[0]), row(sessions[1])],
			},
			{
				kind: "repo",
				key: "/two",
				label: "two",
				rows: [row(sessions[2]), row(sessions[3])],
			},
		]);
	});

	it("floats only the group past a longer configured threshold", () => {
		const sessions = [
			session("a", "/one"),
			waiting("b", "/one", 8000),
			session("c", "/two"),
			waiting("d", "/two", 12_000),
		];

		const groups = groupSessionsByRepo(
			sessions,
			() => false,
			waitedPast(10_000),
		);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/two",
				label: "two",
				rows: [row(sessions[3]), row(sessions[2])],
			},
			{
				kind: "repo",
				key: "/one",
				label: "one",
				rows: [row(sessions[0]), row(sessions[1])],
			},
		]);
	});

	it("floats a briefly waiting member on a shorter configured threshold", () => {
		const sessions = [
			session("a", "/one"),
			session("b", "/one"),
			waiting("c", "/two", 900),
			session("d", "/two"),
		];

		const groups = groupSessionsByRepo(sessions, () => false, waitedPast(500));

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/two",
				label: "two",
				rows: [row(sessions[2]), row(sessions[3])],
			},
			{
				kind: "repo",
				key: "/one",
				label: "one",
				rows: [row(sessions[0]), row(sessions[1])],
			},
		]);
	});

	it("treats repos sharing a last segment but differing in full path as distinct", () => {
		const sessions = [
			session("a", "/home/me/work/assist"),
			session("b", "/home/me/work/assist"),
			session("c", "/home/me/play/assist"),
			session("d", "/home/me/play/assist"),
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/home/me/work/assist",
				label: "assist",
				rows: [row(sessions[0]), row(sessions[1])],
			},
			{
				kind: "repo",
				key: "/home/me/play/assist",
				label: "assist",
				rows: [row(sessions[2]), row(sessions[3])],
			},
		]);
	});

	it("nests a worktree session under the backlog run sharing its cwd", () => {
		const sessions = [
			backlogRun("run", "/git/assist-2"),
			inWorktree("review", "/git/assist-2"),
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "host/org/assist",
				label: "assist",
				rows: [row(sessions[0]!, sessions[1]!)],
			},
		]);
	});

	it("floats a whole nested row when only its child is waiting", () => {
		const sessions = [
			inWorktree("other", "/git/assist-3"),
			backlogRun("run", "/git/assist-2"),
			inWorktree("review", "/git/assist-2"),
		];
		const waiting = new Set(["review"]);

		const groups = groupSessionsByRepo(
			sessions,
			() => false,
			(s) => waiting.has(s.id),
		);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "host/org/assist",
				label: "assist",
				rows: [row(sessions[1]!, sessions[2]!), row(sessions[0]!)],
			},
		]);
	});

	it("floats a whole repo group whose only waiter is a nested child", () => {
		const otherGroup = { origin: "host/org/other", clone: "/git/other" };
		const sessions = [
			{ ...session("x", "/git/other"), repoGroup: otherGroup },
			{ ...session("y", "/git/other-2"), repoGroup: otherGroup },
			backlogRun("run", "/git/assist-2"),
			inWorktree("review", "/git/assist-2"),
		];
		const waiting = new Set(["review"]);

		const groups = groupSessionsByRepo(
			sessions,
			() => false,
			(s) => waiting.has(s.id),
		);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "host/org/assist",
				label: "assist",
				rows: [row(sessions[2]!, sessions[3]!)],
			},
			{
				kind: "repo",
				key: "host/org/other",
				label: "other",
				rows: [row(sessions[0]!), row(sessions[1]!)],
			},
		]);
	});

	it("keeps children adjacent beneath a starred parent lifted to the front", () => {
		const sessions = [
			inWorktree("other", "/git/assist-3"),
			backlogRun("run", "/git/assist-2"),
			inWorktree("review", "/git/assist-2"),
			inWorktree("comments", "/git/assist-2"),
		];
		const starred = new Set(["run"]);

		const groups = groupSessionsByRepo(sessions, (s) => starred.has(s.id));

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "host/org/assist",
				label: "assist",
				rows: [
					row(sessions[1]!, sessions[2]!, sessions[3]!),
					row(sessions[0]!),
				],
			},
		]);
	});

	it("keeps a starred nested row above a row floated by a waiting child", () => {
		const sessions = [
			backlogRun("waitingRun", "/git/assist-2"),
			inWorktree("waitingReview", "/git/assist-2"),
			backlogRun("starredRun", "/git/assist-3"),
			inWorktree("starredReview", "/git/assist-3"),
		];
		const starred = new Set(["starredReview"]);
		const waiting = new Set(["waitingReview"]);

		const groups = groupSessionsByRepo(
			sessions,
			(s) => starred.has(s.id),
			(s) => waiting.has(s.id),
		);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "host/org/assist",
				label: "assist",
				rows: [
					row(sessions[2]!, sessions[3]!),
					row(sessions[0]!, sessions[1]!),
				],
			},
		]);
	});

	it("leaves a main-clone session un-nested alongside a run in the clone", () => {
		const sessions = [
			backlogRun("run", "/git/assist"),
			inWorktree("review", "/git/assist"),
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "host/org/assist",
				label: "assist",
				rows: [row(sessions[0]!), row(sessions[1]!)],
			},
		]);
	});
});
