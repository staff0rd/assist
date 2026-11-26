import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { resolveClaudeExecutable } from "../../../sessions/daemon/resolveClaudeExecutable";
import { type ManualStepsInput, runManualStep } from "./runManualStep";
import type { StepVerdict } from "./StepVerdict";

export async function runManualSteps(
	input: ManualStepsInput,
): Promise<StepVerdict[]> {
	const executable = resolveClaudeExecutable();
	const browser = await chromium.launch();
	const verdicts: StepVerdict[] = [];
	try {
		const page = await browser.newPage({
			viewport: { width: 1280, height: 800 },
		});
		await page.goto(input.url);
		for (const [index, { action }] of input.manualTesting.steps.entries()) {
			console.log(`Step ${index + 1}: ${action}`);
			verdicts.push(
				await runManualStep(page, input, index, verdicts, executable),
			);
			writeFileSync(
				join(input.reportDir, "report.json"),
				`${JSON.stringify({ url: input.url, steps: verdicts }, null, 2)}\n`,
			);
		}
	} finally {
		await browser.close();
	}
	return verdicts;
}
