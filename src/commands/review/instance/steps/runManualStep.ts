import type { Page } from "playwright";
import type { HighLevelManualTesting } from "../../highLevel/types";
import type { StepErrorLog } from "../logs/createStepErrorLog";
import { buildStepPrompt } from "./buildStepPrompt";
import { createInputTools } from "./createInputTools";
import { createPageTools } from "./createPageTools";
import { createVerdictTool } from "./createVerdictTool";
import { runStepAgent } from "./runStepAgent";
import type { StepVerdict } from "./StepVerdict";
import { stepScreenshotPath } from "./stepScreenshotPath";

export type ManualStepsInput = {
	url: string;
	manualTesting: HighLevelManualTesting;
	reportDir: string;
	abort: AbortController;
	headed?: boolean;
	errorLog: StepErrorLog;
};

export async function runManualStep(
	page: Page,
	input: ManualStepsInput,
	index: number,
	earlier: StepVerdict[],
	executable: string,
): Promise<StepVerdict> {
	const { action, expect } = input.manualTesting.steps[index];
	const step = index + 1;
	const screenshot = stepScreenshotPath(input.reportDir, step);
	let recorded: Pick<StepVerdict, "verdict" | "note"> | undefined;
	const verdictTool = createVerdictTool(async (verdict) => {
		await page.screenshot({ path: screenshot });
		recorded = verdict;
	});
	await runStepAgent({
		prompt: buildStepPrompt(input.url, input.manualTesting, index, earlier),
		tools: [
			...createPageTools(page, input.url),
			...createInputTools(page),
			verdictTool,
		],
		cwd: input.reportDir,
		executable,
		abort: input.abort,
	});
	if (!recorded) {
		await page.screenshot({ path: screenshot });
		recorded = { verdict: "unsure", note: "The agent recorded no verdict." };
	}
	return { step, action, expect, ...recorded, screenshot };
}
