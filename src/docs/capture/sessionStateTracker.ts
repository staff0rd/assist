import { copyFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { CaptureSetupStep } from "../captureSetupStepSchema";
import { docsPaths } from "../docsPaths";
import { closePreviews } from "./closePreviews";
import type { CaptureHome } from "./createCaptureHome";
import { resetBacklog } from "./resetBacklog";
import { removeCaptureWorktrees } from "./removeCaptureWorktrees";
import { resetPeers } from "./resetPeers";
import { runAssist } from "./runAssist";
import { runSetupStep } from "./runSetupStep";
import { fakeGhResponsesFile } from "./writeFakeGhResponse";

export function sessionStateTracker(capture: CaptureHome) {
	let current = "[]";
	return async (steps: CaptureSetupStep[]) => {
		const next = JSON.stringify(steps);
		if (next === current) return;
		if (current !== "[]") {
			closePreviews(capture);
			runAssist(capture, ["daemon", "drain", "--yes"]);
			resetPeers(capture);
			removeCaptureWorktrees(capture);
			rmSync(join(capture.home, ".claude", "projects"), {
				recursive: true,
				force: true,
			});
			rmSync(join(capture.home, ".fake-gh.json"), { force: true });
			rmSync(fakeGhResponsesFile(capture), { force: true });
			copyFileSync(docsPaths.captureConfig, join(capture.home, ".assist.yml"));
			await resetBacklog(capture);
		}
		for (const step of steps) await runSetupStep(capture, step);
		current = next;
	};
}
