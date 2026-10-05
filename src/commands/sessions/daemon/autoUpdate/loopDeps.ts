import { daemonLog } from "../daemonLog";
import { appendWatcherLog } from "../worktree/appendWatcherLog";
import type { TreeSpawnContext } from "../worktree/allocateAndBind";
import { canonicalTreePath } from "../worktree/canonicalTreePath";
import { escalateDivergence } from "../worktree/escalateDivergence";
import { liveEscalationIn } from "../worktree/liveEscalationIn";
import { autoUpdateControl } from "./autoUpdateControl";
import { autoUpdateState } from "./autoUpdateState";
import { lineRecorder } from "./lineRecorder";
import { noteAutoUpdate } from "./noteAutoUpdate";
import type { AutoUpdateDeps } from "./AutoUpdateDeps";
import { runUpdateLap } from "./runUpdateLap";

export function loopDeps(
	installDir: string,
	ctx: () => TreeSpawnContext,
): AutoUpdateDeps {
	const clone = canonicalTreePath(installDir);
	const logLine = lineRecorder((line) => daemonLog(`auto-update: ${line}`));
	return {
		runLap: (onOutput) => runUpdateLap(installDir, onOutput),
		record: (text) => {
			appendWatcherLog(installDir, text);
			logLine(text);
		},
		note: (text) => noteAutoUpdate(installDir, text),
		enter: autoUpdateState.enter,
		liveEscalation: () => liveEscalationIn(ctx().sessions, clone)?.id,
		escalate: (output) => escalateDivergence(ctx(), installDir, output),
		isLive: (sessionId) => {
			const status = ctx().sessions.get(sessionId)?.status;
			return status !== undefined && status !== "done" && status !== "error";
		},
		paused: autoUpdateControl.paused,
		sleep: autoUpdateControl.sleep,
	};
}
