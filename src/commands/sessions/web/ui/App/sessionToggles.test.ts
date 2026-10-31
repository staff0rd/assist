import { describe, expect, it } from "vitest";
import { sessionToggles } from "./sessionToggles";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";

const backlogActivity = {
	kind: "backlog" as const,
	startedAt: 0,
	phase: 1,
	totalPhases: 3,
};

describe("sessionToggles auto-approve", () => {
	it.each(["draft", "bug", "refine"])(
		"offers an auto-approve toggle, off by default, on a %s session",
		(command) => {
			expect(
				sessionToggles(
					makeSessionInfo({ commandType: "assist", assistArgs: [command] }),
				),
			).toEqual([
				{ key: "autoApprove", label: "Auto approve & start", checked: false },
			]);
		},
	);

	it("captions auto-approve when it is switched on", () => {
		expect(
			sessionToggles(
				makeSessionInfo({
					commandType: "assist",
					assistArgs: ["draft"],
					autoApprove: true,
				}),
			),
		).toEqual([
			{
				key: "autoApprove",
				label: "Auto approve & start",
				checked: true,
				caption: "will approve & start",
			},
		]);
	});

	it("offers no auto-approve toggle on other sessions", () => {
		expect(sessionToggles(makeSessionInfo({ commandType: "claude" }))).toEqual(
			[],
		);
	});
});

describe("sessionToggles continue", () => {
	it("captions a backlog run only when continue is switched off", () => {
		expect(
			sessionToggles(
				makeSessionInfo({ commandType: "assist", activity: backlogActivity }),
			),
		).toEqual([{ key: "autoAdvance", label: "Continue", checked: true }]);
		expect(
			sessionToggles(
				makeSessionInfo({
					commandType: "assist",
					activity: backlogActivity,
					autoAdvance: false,
				}),
			),
		).toEqual([
			{
				key: "autoAdvance",
				label: "Continue",
				checked: false,
				caption: "won't continue",
			},
		]);
	});
});

describe("sessionToggles review phase", () => {
	it.each([true, false])(
		"offers no continue toggle in the review phase (autoAdvance %s)",
		(autoAdvance) => {
			expect(
				sessionToggles(
					makeSessionInfo({
						commandType: "assist",
						activity: { ...backlogActivity, phase: 3 },
						autoAdvance,
					}),
				),
			).toEqual([]);
		},
	);
});
