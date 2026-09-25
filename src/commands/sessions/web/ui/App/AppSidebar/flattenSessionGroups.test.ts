import { describe, expect, it } from "vitest";
import { flattenSessionGroups } from "./flattenSessionGroups";
import { groupSessionsByRepo } from "./groupSessionsByRepo";
import type { SessionInfo } from "../../types";

const repoGroup = { origin: "host/org/assist", clone: "/git/assist" };

function session(id: string, cwd: string): SessionInfo {
	return {
		id,
		name: id,
		commandType: "assist",
		status: "running",
		startedAt: 0,
		cwd,
		repoGroup,
	};
}

function backlogRun(id: string, cwd: string): SessionInfo {
	return { ...session(id, cwd), activity: { kind: "backlog", startedAt: 0 } };
}

function flatten(sessions: SessionInfo[]): string[] {
	return flattenSessionGroups(groupSessionsByRepo(sessions, () => false)).map(
		(s) => s.id,
	);
}

describe("flattenSessionGroups", () => {
	it("emits each row's parent immediately before its children", () => {
		expect(
			flatten([
				session("clone", "/git/assist"),
				backlogRun("run", "/git/assist-2"),
				session("review", "/git/assist-2"),
			]),
		).toEqual(["clone", "run", "review"]);
	});

	it("emits a child listed before its run after the run", () => {
		expect(
			flatten([
				session("review", "/git/assist-2"),
				backlogRun("run", "/git/assist-2"),
				session("clone", "/git/assist"),
			]),
		).toEqual(["run", "review", "clone"]);
	});

	it("emits un-nested group members in their group order", () => {
		expect(
			flatten([session("a", "/git/assist"), session("b", "/git/assist-2")]),
		).toEqual(["a", "b"]);
	});

	it("emits an orphaned child at the top level once its run is gone", () => {
		expect(
			flatten([
				session("clone", "/git/assist"),
				session("review", "/git/assist-2"),
			]),
		).toEqual(["clone", "review"]);
	});
});
