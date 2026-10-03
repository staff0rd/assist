import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { flattenSessionGroups } from "./flattenSessionGroups";
import { groupSessionsByRepo } from "./groupSessionsByRepo";
import type { SessionInfo } from "../../types";

const repoGroup = { origin: "host/org/assist", clone: "/git/assist" };
const backlog = { kind: "backlog" as const, startedAt: 0 };

function flatten(sessions: SessionInfo[]): string[] {
	return flattenSessionGroups(groupSessionsByRepo(sessions, () => false)).map(
		(s) => s.id,
	);
}

describe("flattenSessionGroups", () => {
	it("emits each row's parent immediately before its children", () => {
		expect(
			flatten([
				makeSessionInfo({ id: "clone", cwd: "/git/assist", repoGroup }),
				makeSessionInfo({
					id: "run",
					cwd: "/git/assist-2",
					repoGroup,
					activity: backlog,
				}),
				makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup }),
			]),
		).toEqual(["clone", "run", "review"]);
	});

	it("emits a child listed before its run after the run", () => {
		expect(
			flatten([
				makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup }),
				makeSessionInfo({
					id: "run",
					cwd: "/git/assist-2",
					repoGroup,
					activity: backlog,
				}),
				makeSessionInfo({ id: "clone", cwd: "/git/assist", repoGroup }),
			]),
		).toEqual(["run", "review", "clone"]);
	});

	it("emits un-nested group members in their group order", () => {
		expect(
			flatten([
				makeSessionInfo({ id: "a", cwd: "/git/assist", repoGroup }),
				makeSessionInfo({ id: "b", cwd: "/git/assist-2", repoGroup }),
			]),
		).toEqual(["a", "b"]);
	});

	it("emits an orphaned child at the top level once its run is gone", () => {
		expect(
			flatten([
				makeSessionInfo({ id: "clone", cwd: "/git/assist", repoGroup }),
				makeSessionInfo({ id: "review", cwd: "/git/assist-2", repoGroup }),
			]),
		).toEqual(["clone", "review"]);
	});
});
