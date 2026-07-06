import { describe, expect, it } from "vitest";
import { groupSessionsByRepo } from "./groupSessionsByRepo";
import type { SessionInfo } from "./types";

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
				sessions: [sessions[0], sessions[1]],
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
				sessions: [sessions[2], sessions[0], sessions[1]],
			},
		]);
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
				sessions: [sessions[0], sessions[1]],
			},
			{
				kind: "repo",
				key: "/home/me/play/assist",
				label: "assist",
				sessions: [sessions[2], sessions[3]],
			},
		]);
	});
});
