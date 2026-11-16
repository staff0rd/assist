import { findCodexRolloutPath } from "../../../shared/codex/findCodexRolloutPath";
import { daemonLog } from "../../daemonLog";
import type { SdkSessionControl } from "../createSdkSessionProcess";

/* why: resumeThread is lazy and only touches the rollout on the next turn, so
 * the resume counts as complete once the thread's rollout is found on disk. */
export function awaitCodexResume(
	label: string,
	threadId: string,
	control: SdkSessionControl,
): void {
	findCodexRolloutPath(threadId).then(
		(rollout) => {
			daemonLog(
				rollout
					? `${label} codex sdk resume complete: ${rollout}`
					: `${label} codex sdk resume found no rollout for thread ${threadId}`,
			);
			control.emit({ kind: "resumed" });
		},
		(error: unknown) => {
			daemonLog(
				`${label} codex sdk resume lookup failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			control.emit({ kind: "resumed" });
		},
	);
}
