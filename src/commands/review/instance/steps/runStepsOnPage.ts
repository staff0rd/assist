import type { Page } from "playwright";
import type { ManualStepsResult } from "./ManualStepsResult";
import { type ManualStepsInput, runManualStep } from "./runManualStep";
import { writeStepsReport } from "./writeStepsReport";

export async function runStepsOnPage(
	page: Page,
	input: ManualStepsInput,
	executable: string,
	videoOffset: () => number | undefined,
	result: ManualStepsResult,
): Promise<void> {
	await page.goto(input.url);
	for (const [index, { action }] of input.manualTesting.steps.entries()) {
		console.log(`Step ${index + 1}: ${action}`);
		const videoOffsetMs = videoOffset();
		const verdict = await runManualStep(
			page,
			input,
			index,
			result.verdicts,
			executable,
		);
		result.verdicts.push({ ...verdict, videoOffsetMs });
		writeStepsReport(input.reportDir, input.url, result);
	}
}
