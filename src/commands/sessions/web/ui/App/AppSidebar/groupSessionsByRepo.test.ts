import { beforeEach, describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { groupSessionsByRepo } from "./groupSessionsByRepo";
import { groupOrderStore } from "./groupSessionsByRepo/groupOrderStore";
import type { SessionInfo } from "../../types";

function row(session: SessionInfo, ...children: SessionInfo[]) {
	return { session, children };
}

const repoGroup = { origin: "host/org/assist", clone: "/git/assist" };
const backlog = { kind: "backlog" as const, startedAt: 0 };

function keys(groups: ReturnType<typeof groupSessionsByRepo>) {
	return groups.map((g) => (g.kind === "repo" ? g.key : g.session.id));
}

beforeEach(() => groupOrderStore.clear());

describe("groupSessionsByRepo", () => {
	it("keeps group order when the first member of a group closes", () => {
		const sessions = [
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/two" }),
			makeSessionInfo({ id: "c", cwd: "/two" }),
			makeSessionInfo({ id: "d", cwd: "/one" }),
			makeSessionInfo({ id: "e", cwd: "/three" }),
		];
		expect(keys(groupSessionsByRepo(sessions, () => false))).toEqual([
			"/one",
			"/two",
			"e",
		]);

		const afterClose = sessions.filter((s) => s.id !== "a");

		expect(keys(groupSessionsByRepo(afterClose, () => false))).toEqual([
			"d",
			"/two",
			"e",
		]);
	});

	it("appends a newly opened repo without moving existing groups", () => {
		const sessions = [
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/two" }),
		];
		groupSessionsByRepo(sessions, () => false);

		const opened = [makeSessionInfo({ id: "n", cwd: "/new" }), ...sessions];

		expect(keys(groupSessionsByRepo(opened, () => false))).toEqual([
			"a",
			"b",
			"n",
		]);
	});

	it("returns an unstarred group to its remembered position", () => {
		const sessions = [
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/two" }),
			makeSessionInfo({ id: "c", cwd: "/three" }),
		];
		const starred = new Set(["c"]);
		expect(
			keys(groupSessionsByRepo(sessions, (s) => starred.has(s.id))),
		).toEqual(["c", "a", "b"]);

		expect(keys(groupSessionsByRepo(sessions, () => false))).toEqual([
			"a",
			"b",
			"c",
		]);
	});

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

	it("groups a single session when the minimum group size is 1", () => {
		const sessions = [makeSessionInfo({ id: "a", cwd: "/home/me/git/assist" })];

		const groups = groupSessionsByRepo(sessions, () => false, 1);

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "/home/me/git/assist",
				label: "assist",
				rows: [row(sessions[0])],
			},
		]);
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

		expect(keys(groups)).toEqual(["/one", "/two"]);
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

	it("keeps waiting sessions in their insertion position, inside and across groups", () => {
		const sessions = [
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/one" }),
			makeSessionInfo({ id: "c", cwd: "/two" }),
			makeSessionInfo({ id: "d", cwd: "/two", status: "waiting" }),
			makeSessionInfo({ id: "e", cwd: "/three", status: "waiting" }),
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
			{ kind: "single", session: sessions[4] },
		]);
	});

	it("lifts a group with a starred member above earlier groups", () => {
		const sessions = [
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/one" }),
			makeSessionInfo({ id: "c", cwd: "/two" }),
			makeSessionInfo({ id: "d", cwd: "/two" }),
		];
		const starred = new Set(["d"]);

		const groups = groupSessionsByRepo(sessions, (s) => starred.has(s.id));

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

	it("lifts a starred standalone session above a group with none", () => {
		const sessions = [
			makeSessionInfo({ id: "a", cwd: "/one" }),
			makeSessionInfo({ id: "b", cwd: "/one" }),
			makeSessionInfo({ id: "c", cwd: "/two" }),
		];
		const starred = new Set(["c"]);

		const groups = groupSessionsByRepo(sessions, (s) => starred.has(s.id));

		expect(keys(groups)).toEqual(["c", "/one"]);
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

	it("lifts a whole nested row when only its child is starred", () => {
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
		const starred = new Set(["review"]);

		const groups = groupSessionsByRepo(sessions, (s) => starred.has(s.id));

		expect(groups).toEqual([
			{
				kind: "repo",
				key: "host/org/assist",
				label: "assist",
				rows: [row(sessions[1]!, sessions[2]!), row(sessions[0]!)],
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
