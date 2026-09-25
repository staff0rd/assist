import { describe, expect, it } from "vitest";
import { sessionToggles } from "./sessionToggles";
import type { SessionInfo } from "../../../types";

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "1",
		name: "a session",
		commandType: "assist",
		status: "running",
		startedAt: 0,
		...overrides,
	};
}

function backlog(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return session({
		activity: { kind: "backlog", startedAt: 0, phase: 1, totalPhases: 3 },
		...overrides,
	});
}

describe("sessionToggles auto-run", () => {
	it("offers auto-run on a draft session, captioned only once enabled", () => {
		const off = sessionToggles(session({ assistArgs: ["draft"] }));
		const on = sessionToggles(
			session({ assistArgs: ["draft"], autoRun: true }),
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
		expect(sessionToggles(session({ assistArgs: ["review"] }))).toEqual([]);
	});
});

describe("sessionToggles continue", () => {
	it("captions a backlog run only when continue is switched off", () => {
		expect(sessionToggles(backlog())).toEqual([
			{ key: "autoAdvance", label: "Continue", checked: true },
		]);
		expect(sessionToggles(backlog({ autoAdvance: false }))).toEqual([
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
		activity: {
			kind: "backlog" as const,
			startedAt: 0,
			phase: 3,
			totalPhases: 3,
		},
	};

	it("captions the review phase only when dismiss is switched on", () => {
		expect(sessionToggles(session({ ...review, autoAdvance: false }))).toEqual([
			{ key: "autoAdvance", label: "Dismiss", checked: false },
		]);
		expect(sessionToggles(session({ ...review, autoAdvance: true }))).toEqual([
			{
				key: "autoAdvance",
				label: "Dismiss",
				checked: true,
				caption: "will dismiss",
			},
		]);
	});
});
