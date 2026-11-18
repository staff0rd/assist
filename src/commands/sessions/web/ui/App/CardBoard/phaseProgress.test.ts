import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import type { SessionInfo } from "../../types";
import { phaseProgress } from "./phaseProgress";

function backlogSession(overrides: Partial<SessionInfo> = {}) {
	return makeSessionInfo({
		status: "running",
		activity: {
			kind: "backlog",
			itemId: 1,
			startedAt: 0,
			phase: 2,
			totalPhases: 4,
			phaseName: "Wire the footer",
		},
		...overrides,
	});
}

describe("phaseProgress", () => {
	it("marks earlier phases done, the current phase and later phases todo", () => {
		expect(phaseProgress(backlogSession())).toEqual({
			count: "2/4",
			name: "Wire the footer",
			label: "Phase 2 of 4: Wire the footer",
			segments: ["done", "current", "todo", "todo"],
		});
	});

	it("fills every segment and says Complete when the session is done", () => {
		expect(phaseProgress(backlogSession({ status: "done" }))).toEqual({
			count: "4/4",
			name: "Complete",
			label: "All 4 phases complete",
			segments: ["done", "done", "done", "done"],
		});
	});

	it("marks the current phase failed when the session errored", () => {
		const progress = phaseProgress(backlogSession({ status: "error" }));
		expect(progress?.segments).toEqual(["done", "failed", "todo", "todo"]);
		expect(progress?.label).toBe("Stopped in phase 2 of 4: Wire the footer");
	});

	it("returns nothing for sessions without backlog phases", () => {
		expect(phaseProgress(makeSessionInfo({}))).toBeUndefined();
		expect(
			phaseProgress(
				makeSessionInfo({
					activity: { kind: "backlog", itemId: 1, startedAt: 0 },
				}),
			),
		).toBeUndefined();
	});
});
