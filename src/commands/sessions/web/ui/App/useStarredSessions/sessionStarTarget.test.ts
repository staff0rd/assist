import { describe, expect, it } from "vitest";
import { sessionStarTarget, starTargetKey } from "./sessionStarTarget";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";

describe("sessionStarTarget", () => {
	it("returns the cwd and item id for a backlog session", () => {
		const target = sessionStarTarget(
			makeSessionInfo({
				cwd: "/repo",
				activity: { kind: "backlog", itemId: 7, startedAt: 0 },
			}),
		);
		expect(target).toEqual({ cwd: "/repo", itemId: 7 });
	});

	it("returns undefined without a cwd", () => {
		expect(
			sessionStarTarget(
				makeSessionInfo({
					activity: { kind: "backlog", itemId: 7, startedAt: 0 },
				}),
			),
		).toBeUndefined();
	});

	it("returns undefined for non-backlog activity", () => {
		expect(
			sessionStarTarget(
				makeSessionInfo({
					cwd: "/repo",
					activity: { kind: "command", itemId: 7, startedAt: 0 },
				}),
			),
		).toBeUndefined();
	});

	it("returns undefined when there is no item id", () => {
		expect(
			sessionStarTarget(
				makeSessionInfo({
					cwd: "/repo",
					activity: { kind: "backlog", startedAt: 0 },
				}),
			),
		).toBeUndefined();
	});
});

describe("starTargetKey", () => {
	it("combines cwd and item id", () => {
		expect(starTargetKey("/repo", 7)).toBe("/repo::7");
	});
});
