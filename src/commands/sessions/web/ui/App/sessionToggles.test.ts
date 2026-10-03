import { describe, expect, it } from "vitest";
import { sessionToggles } from "./sessionToggles";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";

const backlogActivity = {
	kind: "backlog" as const,
	startedAt: 0,
	phase: 1,
	totalPhases: 3,
};

describe("sessionToggles auto-run", () => {
	it("offers auto-run on a draft session, captioned only once enabled", () => {
		const off = sessionToggles(
			makeSessionInfo({ commandType: "assist", assistArgs: ["draft"] }),
		);
		const on = sessionToggles(
			makeSessionInfo({
				commandType: "assist",
				assistArgs: ["draft"],
				autoRun: true,
			}),
		);

		expect(off).toEqual([
			{ key: "autoRun", label: "Auto-run", checked: false },
		]);
		expect(on).toEqual([
			{
				key: "autoRun",
				label: "Auto-run",
				checked: true,
				caption: "will auto-run",
			},
		]);
	});

	it("offers no auto-run on a session type that cannot chain", () => {
		expect(
			sessionToggles(
				makeSessionInfo({ commandType: "assist", assistArgs: ["review"] }),
			),
		).toEqual([]);
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

describe("sessionToggles dismiss", () => {
	const review = {
		commandType: "assist" as const,
		activity: {
			kind: "backlog" as const,
			startedAt: 0,
			phase: 3,
			totalPhases: 3,
		},
	};

	it("captions the review phase only when dismiss is switched on", () => {
		expect(
			sessionToggles(makeSessionInfo({ ...review, autoAdvance: false })),
		).toEqual([{ key: "autoAdvance", label: "Dismiss", checked: false }]);
		expect(
			sessionToggles(makeSessionInfo({ ...review, autoAdvance: true })),
		).toEqual([
			{
				key: "autoAdvance",
				label: "Dismiss",
				checked: true,
				caption: "will dismiss",
			},
		]);
	});
});
