import { describe, expect, it } from "vitest";
import { formatStepsSummary } from "./formatStepsSummary";
import { stepsExitCode } from "./stepsExitCode";
import type { StepVerdict } from "./StepVerdict";

function step(n: number, verdict: StepVerdict["verdict"]): StepVerdict {
	return {
		step: n,
		action: `Action ${n}`,
		expect: `Expect ${n}`,
		verdict,
		note: `Note ${n}`,
		screenshot: `/r/step-0${n}.png`,
	};
}

describe("formatStepsSummary", () => {
	it("lists each step's verdict, note and screenshot with totals and the report path", () => {
		expect(
			formatStepsSummary(
				[step(1, "pass"), step(2, "fail"), step(3, "unsure")],
				"/r",
			),
		).toBe(
			[
				"Manual testing:",
				"  ✓ 1. PASS Action 1",
				"      Note 1",
				"      /r/step-01.png",
				"  ✗ 2. FAIL Action 2",
				"      Note 2",
				"      /r/step-02.png",
				"  ? 3. UNSURE Action 3",
				"      Note 3",
				"      /r/step-03.png",
				"1 passed, 1 failed, 1 unsure",
				"Report: /r/report.json",
			].join("\n"),
		);
	});
});

describe("formatStepsSummary with a video", () => {
	it("lists each step's start offset in the video and the video path", () => {
		const steps = [
			{ ...step(1, "pass"), videoOffsetMs: 0 },
			{ ...step(2, "pass"), videoOffsetMs: 74_250 },
		];
		expect(formatStepsSummary(steps, "/r", "/r/session.webm")).toBe(
			[
				"Manual testing:",
				"  ✓ 1. PASS Action 1 (video 0:00)",
				"      Note 1",
				"      /r/step-01.png",
				"  ✓ 2. PASS Action 2 (video 1:14)",
				"      Note 2",
				"      /r/step-02.png",
				"2 passed, 0 failed, 0 unsure",
				"Video: /r/session.webm",
				"Report: /r/report.json",
			].join("\n"),
		);
	});
});

describe("stepsExitCode", () => {
	it("is 1 when any step fails", () => {
		expect(stepsExitCode([step(1, "pass"), step(2, "fail")])).toBe(1);
	});

	it("is 0 when steps pass or are unsure", () => {
		expect(stepsExitCode([step(1, "pass"), step(2, "unsure")])).toBe(0);
	});
});
