import { chromium } from "playwright";
import { resolveClaudeExecutable } from "../../../sessions/daemon/resolveClaudeExecutable";
import {
	browserContextOptions,
	browserLaunchOptions,
} from "./browserLaunchOptions";
import { watchBrowserErrors } from "../logs/watchBrowserErrors";
import { createVideoClock } from "./createVideoClock";
import type { ManualStepsResult } from "./ManualStepsResult";
import type { ManualStepsInput } from "./runManualStep";
import { runStepsOnPage } from "./runStepsOnPage";
import { saveSessionVideo } from "./saveSessionVideo";
import { writeStepsReport } from "./writeStepsReport";

export async function runManualSteps(
	input: ManualStepsInput,
): Promise<ManualStepsResult> {
	const executable = resolveClaudeExecutable();
	const headed = input.headed ?? false;
	const browser = await chromium.launch(browserLaunchOptions(headed));
	const result: ManualStepsResult = { verdicts: [] };
	try {
		const context = await browser.newContext(
			browserContextOptions(headed, input.reportDir),
		);
		const page = await context.newPage();
		watchBrowserErrors(page, input.errorLog.record);
		try {
			await runStepsOnPage(
				page,
				input,
				executable,
				createVideoClock(!headed),
				result,
			);
		} finally {
			await context.close();
			result.video = await saveSessionVideo(page, input.reportDir);
			writeStepsReport(input.reportDir, input.url, result);
		}
	} finally {
		await browser.close();
	}
	return result;
}
