import { afterEach, describe, expect, it } from "vitest";
import { resumeNudge } from "./resumeNudge";

describe("resumeNudge", () => {
	afterEach(() => {
		delete process.env.ASSIST_RESUME_IDLE;
		delete process.env.ASSIST_RESUME_PROMPT;
	});

	it("returns the restart nudge for a session that was mid-work", () => {
		delete process.env.ASSIST_RESUME_IDLE;
		expect(resumeNudge()).toBe(
			"A restart interrupted this conversation. Continue from where you left off.",
		);
	});

	it("returns an empty prompt for an idle resume so the session reopens without a nudge", () => {
		process.env.ASSIST_RESUME_IDLE = "1";
		expect(resumeNudge()).toBe("");
	});

	it("prefers the reason the daemon recorded for the restart", () => {
		process.env.ASSIST_RESUME_PROMPT = "The assist sessions daemon restarted.";
		expect(resumeNudge()).toBe("The assist sessions daemon restarted.");
	});

	it("stays silent when idle even if a reason was recorded", () => {
		process.env.ASSIST_RESUME_IDLE = "1";
		process.env.ASSIST_RESUME_PROMPT = "The assist sessions daemon restarted.";
		expect(resumeNudge()).toBe("");
	});
});
