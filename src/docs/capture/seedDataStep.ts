import type { CaptureSetupStep } from "../captureSetupStepSchema";
import { addNewsFeed } from "./addNewsFeed";
import type { CaptureHome } from "./createCaptureHome";
import { runCaptureSql } from "./runCaptureSql";
import { writeFakeGhResponse } from "./writeFakeGhResponse";

export async function seedDataStep(
	capture: CaptureHome,
	step: CaptureSetupStep,
): Promise<boolean> {
	if ("gh" in step) writeFakeGhResponse(capture, step.gh);
	else if ("sql" in step) await runCaptureSql(capture, step.sql);
	else if ("newsFeed" in step) await addNewsFeed(capture, step.newsFeed);
	else if ("connectMobile" in step)
		capture.apiStubs.set("/api/connect-mobile", {
			ok: true,
			...step.connectMobile,
		});
	else return false;
	return true;
}
