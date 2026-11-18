import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { workingActivity } from "./workingActivity";

const backlogActivity = {
	kind: "backlog" as const,
	itemId: 1,
	startedAt: 0,
	phase: 2,
	totalPhases: 3,
	phaseName: "Wire the footer",
};

describe("workingActivity", () => {
	it("prefers the SDK activity", () => {
		expect(
			workingActivity(
				makeSessionInfo({
					sdkActivity: "Reading a file",
					lastAssistantMessage: "Done",
				}),
			),
		).toBe("Reading a file");
	});

	it("falls back to the last assistant message rather than the phase", () => {
		expect(
			workingActivity(
				makeSessionInfo({
					activity: backlogActivity,
					lastAssistantMessage: "Running verify",
				}),
			),
		).toBe("Running verify");
	});

	it("says Working when there is nothing else", () => {
		expect(
			workingActivity(makeSessionInfo({ activity: backlogActivity })),
		).toBe("Working");
	});
});
