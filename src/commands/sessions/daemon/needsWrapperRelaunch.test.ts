import { describe, expect, it } from "vitest";
import type { PersistedSession } from "./loadPersistedSessions";
import { needsWrapperRelaunch } from "./needsWrapperRelaunch";

function persisted(assistArgs: string[]): PersistedSession {
	return {
		name: assistArgs.join(" "),
		commandType: "assist",
		cwd: "/git/assist-7",
		startedAt: 0,
		assistArgs,
	};
}

describe("needsWrapperRelaunch", () => {
	it("relaunches a backlog run through its wrapper", () => {
		expect(needsWrapperRelaunch(persisted(["backlog", "run", "a1"]))).toBe(
			true,
		);
	});

	it("relaunches a parallel phase through its wrapper so it still lands, cancels and exits", () => {
		expect(
			needsWrapperRelaunch(
				persisted(["backlog", "run-phase", "a1", "2", "--token", "t"]),
			),
		).toBe(true);
	});

	it("resumes other assist sessions directly", () => {
		expect(needsWrapperRelaunch(persisted(["review", "2269"]))).toBe(false);
	});
});
