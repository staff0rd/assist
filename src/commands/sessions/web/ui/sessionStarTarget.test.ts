import { describe, expect, it } from "vitest";
import { sessionStarTarget, starTargetKey } from "./sessionStarTarget";
import type { SessionInfo } from "./types";

function session(overrides: Partial<SessionInfo>): SessionInfo {
	return {
		id: "1",
		name: "s",
		commandType: "run",
		status: "running",
		startedAt: 0,
		...overrides,
	};
}

describe("sessionStarTarget", () => {
	it("returns the cwd and item id for a backlog session", () => {
		const target = sessionStarTarget(
			session({
				cwd: "/repo",
				activity: { kind: "backlog", itemId: 7, startedAt: 0 },
			}),
		);
		expect(target).toEqual({ cwd: "/repo", itemId: 7 });
	});

	it("returns undefined without a cwd", () => {
		expect(
			sessionStarTarget(
				session({ activity: { kind: "backlog", itemId: 7, startedAt: 0 } }),
			),
		).toBeUndefined();
	});

	it("returns undefined for non-backlog activity", () => {
		expect(
			sessionStarTarget(
				session({
					cwd: "/repo",
					activity: { kind: "command", itemId: 7, startedAt: 0 },
				}),
			),
		).toBeUndefined();
	});

	it("returns undefined when there is no item id", () => {
		expect(
			sessionStarTarget(
				session({ cwd: "/repo", activity: { kind: "backlog", startedAt: 0 } }),
			),
		).toBeUndefined();
	});
});

describe("starTargetKey", () => {
	it("combines cwd and item id", () => {
		expect(starTargetKey("/repo", 7)).toBe("/repo::7");
	});
});
