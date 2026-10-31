import { describe, expect, it } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import { otherAgentTreeHolders } from "./otherAgentTreeHolders";

const inTree = {
	commandType: "claude",
	status: "running",
	cwd: "/git/repo-2",
	worktree: { path: "/git/repo-2", clone: "/git/repo" },
} satisfies Partial<Session>;

function map(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((s) => [s.id, s]));
}

describe("otherAgentTreeHolders", () => {
	it("ignores run sessions in the same tree", () => {
		const agent = makeSession({ ...inTree, id: "1" });
		const run = makeSession({ ...inTree, id: "2", commandType: "run" });

		expect(otherAgentTreeHolders(map(agent, run), agent)).toEqual([]);
	});

	it("counts another agent in the same tree", () => {
		const agent = makeSession({ ...inTree, id: "1" });
		const sibling = makeSession({ ...inTree, id: "2" });
		const run = makeSession({ ...inTree, id: "3", commandType: "run" });

		expect(
			otherAgentTreeHolders(map(agent, sibling, run), agent).map((s) => s.id),
		).toEqual(["2"]);
	});
});
