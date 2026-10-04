import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { groupSessionsByRepo } from "./groupSessionsByRepo";
import { hasWaitedPastThreshold } from "./useSidebarOrdering/sortSessionsByWaiting";
import type { SessionInfo } from "../../types";

const NOW = 1_000_000;

function waitedPast(thresholdMs: number): (session: SessionInfo) => boolean {
	return (session) => hasWaitedPastThreshold(session, NOW, thresholdMs);
}

function row(session: SessionInfo, ...children: SessionInfo[]) {
	return { session, children };
}

const repoGroup = { origin: "host/org/assist", clone: "/git/assist" };
const backlog = { kind: "backlog" as const, startedAt: 0 };

describe("groupSessionsByRepo", () => {
	it("groups 2+ sessions sharing a cwd under a repo entry", () => {
		const sessions = [
			makeSessionInfo({ id: "a", cwd: "/home/me/git/assist" }),
			makeSessionInfo({ id: "b", cwd: "/home/me/git/assist" }),
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
		const sessions = [makeSessionInfo({ id: "a", cwd: "/home/me/git/assist" })];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([{ kind: "single", session: sessions[0] }]);
	});

	it("pins starred sessions above non-starred within a group", () => {
		const sessions = [
			makeSessionInfo({ id: "a", cwd: "/repo" }),
			makeSessionInfo({ id: "b", cwd: "/repo" }),
			makeSessionInfo({ id: "c", cwd: "/repo" }),
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

	it("orders groups by each repo's first appearance", () => {
		const sessions = [
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/two" }),
			makeSessionInfo({ id: "c", cwd: "/one" }),
			makeSessionInfo({ id: "d", cwd: "/two" }),
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(
			groups.map((g) => (g.kind === "repo" ? g.key : g.session.id)),
		).toEqual(["/one", "/two"]);
	});

	it("keeps no-cwd sessions as separate standalone cards", () => {
		const sessions = [
			makeSessionInfo({ id: "a" }),
			makeSessionInfo({ id: "b" }),
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([
			{ kind: "single", session: sessions[0] },
			{ kind: "single", session: sessions[1] },
		]);
	});

	it("groups a clone and its worktrees under one entry named after the clone", () => {
		const group = { origin: "host/org/assist", clone: "/git/assist" };
		const sessions = [
			makeSessionInfo({ id: "a", cwd: "/git/assist", repoGroup: group }),
			makeSessionInfo({ id: "b", cwd: "/git/assist-2", repoGroup: group }),
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
			makeSessionInfo({
				id: "a",
				cwd: "/git/assist",
				repoGroup: { origin: "host/org/assist", clone: "/git/assist" },
			}),
			makeSessionInfo({
				id: "b",
				cwd: "/git/other",
				repoGroup: { origin: "host/org/other", clone: "/git/other" },
			}),
		];

		const groups = groupSessionsByRepo(sessions, () => false);

		expect(groups).toEqual([
			{ kind: "single", session: sessions[0] },
			{ kind: "single", session: sessions[1] },
		]);
	});

	it("floats the waiting member to the top of its group", () => {
		const sessions = [
			makeSessionInfo({ id: "a", cwd: "/repo" }),
			makeSessionInfo({ id: "b", cwd: "/repo" }),
			makeSessionInfo({ id: "c", cwd: "/repo" }),
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
			makeSessionInfo({ id: "a", cwd: "/repo" }),
			makeSessionInfo({ id: "b", cwd: "/repo" }),
			makeSessionInfo({ id: "c", cwd: "/repo" }),
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
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/one" }),
			makeSessionInfo({ id: "c", cwd: "/two" }),
			makeSessionInfo({ id: "d", cwd: "/two" }),
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
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/one" }),
			makeSessionInfo({ id: "c", cwd: "/two" }),
			makeSessionInfo({ id: "d", cwd: "/two" }),
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
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/one" }),
			makeSessionInfo({ id: "c", cwd: "/two" }),
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
			makeSessionInfo({ id: "longest", cwd: "/two" }),
			makeSessionInfo({ id: "shorter", cwd: "/one" }),
			makeSessionInfo({ id: "idle", cwd: "/one" }),
			makeSessionInfo({ id: "other", cwd: "/two" }),
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
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/one" }),
			makeSessionInfo({ id: "c", cwd: "/two" }),
			makeSessionInfo({ id: "d", cwd: "/two" }),
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
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/one" }),
			makeSessionInfo({ id: "c", cwd: "/two" }),
			makeSessionInfo({ id: "d", cwd: "/two" }),
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
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({
				id: "b",
				cwd: "/one",
				status: "waiting",
				waitingSince: NOW - 8000,
			}),
			makeSessionInfo({ id: "c", cwd: "/two" }),
			makeSessionInfo({
				id: "d",
				cwd: "/two",
				status: "waiting",
				waitingSince: NOW - 12_000,
			}),
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
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/one" }),
			makeSessionInfo({
				id: "c",
				cwd: "/two",
				status: "waiting",
				waitingSince: NOW - 900,
			}),
			makeSessionInfo({ id: "d", cwd: "/two" }),
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
			makeSessionInfo({ id: "a", cwd: "/home/me/work/assist" }),
			makeSessionInfo({ id: "b", cwd: "/home/me/work/assist" }),
			makeSessionInfo({ id: "c", cwd: "/home/me/play/assist" }),
			makeSessionInfo({ id: "d", cwd: "/home/me/play/assist" }),
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
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist-2",
				repoGroup,
				activity: backlog,
			}),
			makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup }),
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
			makeSessionInfo({ id: "other", cwd: "/git/assist-3", repoGroup }),
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist-2",
				repoGroup,
				activity: backlog,
			}),
			makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup }),
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
			makeSessionInfo({ id: "x", cwd: "/git/other", repoGroup: otherGroup }),
			makeSessionInfo({ id: "y", cwd: "/git/other-2", repoGroup: otherGroup }),
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist-2",
				repoGroup,
				activity: backlog,
			}),
			makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup }),
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
			makeSessionInfo({ id: "other", cwd: "/git/assist-3", repoGroup }),
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist-2",
				repoGroup,
				activity: backlog,
			}),
			makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup }),
			makeSessionInfo({ id: "comments", cwd: "/git/assist-2", repoGroup }),
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
			makeSessionInfo({
				id: "waitingRun",
				cwd: "/git/assist-2",
				repoGroup,
				activity: backlog,
			}),
			makeSessionInfo({ id: "waitingReview", cwd: "/git/assist-2", repoGroup }),
			makeSessionInfo({
				id: "starredRun",
				cwd: "/git/assist-3",
				repoGroup,
				activity: backlog,
			}),
			makeSessionInfo({ id: "starredReview", cwd: "/git/assist-3", repoGroup }),
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
			makeSessionInfo({
				id: "run",
				cwd: "/git/assist",
				repoGroup,
				activity: backlog,
			}),
			makeSessionInfo({ id: "review", cwd: "/git/assist", repoGroup }),
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
