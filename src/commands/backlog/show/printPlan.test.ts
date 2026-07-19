import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BacklogItem, PhaseSession, PlanPhase } from "../types";
import { printPlan } from "./printPlan";

const phases: PlanPhase[] = [
	{ name: "First", tasks: [{ task: "do a" }] },
	{ name: "Second", tasks: [{ task: "do b" }] },
];

function item(phaseSessions?: PhaseSession[]): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "Item",
		acceptanceCriteria: [],
		status: "in-progress",
		starred: false,
		plan: phases,
		...(phaseSessions ? { phaseSessions } : {}),
	};
}

describe("printPlan", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
	});

	const output = () =>
		logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");

	it("prints no session section when a phase has no sessions", () => {
		printPlan(item());

		const out = output();
		expect(out).not.toContain("Sessions:");
	});

	it("prints machine, user, and session id under the phase that ran", () => {
		printPlan(
			item([
				{
					phaseIdx: 0,
					claudeSessionId: "sess-a",
					hostname: "host-1",
					osUser: "alice",
				},
				{
					phaseIdx: 0,
					claudeSessionId: "sess-b",
					hostname: "host-2",
					osUser: "bob",
				},
			]),
		);

		const out = output();
		expect(out).toContain("Sessions:");
		expect(out).toContain("host-1 / alice / sess-a");
		expect(out).toContain("host-2 / bob / sess-b");
	});

	it("renders sessions for the auto-appended review phase beyond the plan", () => {
		printPlan(
			item([
				{
					phaseIdx: 2,
					claudeSessionId: "sess-review",
					hostname: "host-r",
					osUser: "carol",
				},
			]),
		);

		const out = output();
		expect(out).toContain("Phase 3: Review");
		expect(out).toContain("host-r / carol / sess-review");
	});

	it("scopes sessions to their own phase", () => {
		printPlan(
			item([
				{
					phaseIdx: 1,
					claudeSessionId: "sess-second",
					hostname: "host-1",
					osUser: "alice",
				},
			]),
		);

		const lines = logSpy.mock.calls.map((c: unknown[]) => String(c[0]));
		const firstIdx = lines.findIndex((l: string) => l.includes("First"));
		const secondIdx = lines.findIndex((l: string) => l.includes("Second"));
		const sessionIdx = lines.findIndex((l: string) =>
			l.includes("sess-second"),
		);

		expect(sessionIdx).toBeGreaterThan(secondIdx);
		expect(sessionIdx).toBeGreaterThan(firstIdx);
	});
});
