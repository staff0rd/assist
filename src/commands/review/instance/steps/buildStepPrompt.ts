import type { HighLevelManualTesting } from "../../highLevel/types";
import type { StepVerdict } from "./StepVerdict";

export function buildStepPrompt(
	url: string,
	manualTesting: HighLevelManualTesting,
	index: number,
	earlier: StepVerdict[],
): string {
	const step = manualTesting.steps[index];
	const lines = [
		`You are manually testing a pull request running at ${url}. Use only the browser tools; the browser keeps its page and state between steps.`,
		"",
	];
	if (manualTesting.setup.length > 0)
		lines.push(
			"Setup the reviewer was asked to do first (do what the browser can, otherwise assume it is done):",
			...manualTesting.setup.map((item) => `- ${item}`),
			"",
		);
	if (earlier.length > 0)
		lines.push(
			"Steps already run:",
			...earlier.map(
				(done) =>
					`${done.step}. ${done.action} → ${done.verdict}: ${done.note}`,
			),
			"",
		);
	lines.push(
		`Step ${index + 1} of ${manualTesting.steps.length}:`,
		`Action: ${step.action}`,
		`Expect: ${step.expect}`,
		"",
		"Perform the action, then check the expectation against what the page shows (take a snapshot or screenshot). Finish by calling record_verdict exactly once: pass when the expectation holds, fail when it does not, unsure when you could not perform the action or judge the result. The note says what you saw.",
	);
	return lines.join("\n");
}
