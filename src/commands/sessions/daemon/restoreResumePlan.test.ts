import { beforeEach, describe, expect, it, vi } from "vitest";
import { interruptedBackgroundTasks } from "./interruptedBackgroundTasks";
import type { PersistedSession } from "./loadPersistedSessions";
import { restoreResumePlan, resumePrompt } from "./restoreResumePlan";

vi.mock("./interruptedBackgroundTasks", () => ({
	interruptedBackgroundTasks: vi.fn(() => []),
}));

const tasksMock = interruptedBackgroundTasks as unknown as ReturnType<
	typeof vi.fn
>;

function persisted(interrupted?: {
	reason: string;
	at: number;
}): PersistedSession {
	return {
		name: "Session 1",
		commandType: "claude",
		cwd: "/repo",
		startedAt: 0,
		interrupted,
	};
}

const restarted = { reason: "daemon-restart", at: 1 };

describe("restoreResumePlan", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		tasksMock.mockReturnValue([]);
	});

	it("leaves an idle session alone when no restart was recorded", () => {
		expect(restoreResumePlan(persisted(), true)).toEqual({ idle: true });
	});

	it("leaves a mid-work session on the default nudge when no restart was recorded", () => {
		const plan = restoreResumePlan(persisted(), false);

		expect(plan).toEqual({ idle: false });
		expect(resumePrompt(plan)).toBe(
			"A restart interrupted this conversation. Continue from where you left off.",
		);
	});

	it("names the daemon restart for a session that was mid-work", () => {
		const plan = restoreResumePlan(persisted(restarted), false);

		expect(plan.idle).toBe(false);
		expect(plan.prompt).toContain("assist sessions daemon restarted");
		expect(plan.prompt).toContain("not a deliberate stop");
	});

	it("leaves an idle session idle when the restart killed no background work", () => {
		expect(restoreResumePlan(persisted(restarted), true)).toEqual({
			idle: true,
		});
	});

	it("wakes an idle session whose background task the restart killed", () => {
		tasksMock.mockReturnValue(["bh1hjrdah"]);

		const plan = restoreResumePlan(persisted(restarted), true);

		expect(plan.idle).toBe(false);
		expect(plan.prompt).toContain("bh1hjrdah");
		expect(plan.prompt).toContain("1 background task(s)");
	});

	it("does not read the transcript for a session the daemon did not kill", () => {
		restoreResumePlan(persisted(), true);

		expect(tasksMock).not.toHaveBeenCalled();
	});

	it("sends nothing to a session left idle", () => {
		expect(resumePrompt({ idle: true })).toBeUndefined();
	});
});
