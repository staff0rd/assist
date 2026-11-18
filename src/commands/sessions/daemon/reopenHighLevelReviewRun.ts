import { previewAwaitingMessage } from "../shared/previewAwaitingMessage";
import { daemonLog } from "./daemonLog";
import type { DeferredDeliveryHost } from "./DeferredDeliveryHost";
import { deliverDeferredResult } from "./deliverDeferredResult";
import { noSavedSlices } from "./noSavedSlices";
import type { ReopenReply } from "./replyOnce";
import { runDeferredCommand } from "./runDeferredCommand";
import { workflowQueryEnv } from "./sdk/workflowQueryEnv";
import {
	trackDeferredCommand,
	untrackDeferredCommand,
} from "./trackDeferredCommand";
import type { Session } from "./types";

export function reopenHighLevelReviewRun(
	m: DeferredDeliveryHost,
	session: Session,
	cwd: string,
	prNumber: number,
	reply: (reply: ReopenReply) => void,
): void {
	const { id } = session;
	const command = {
		argv: ["review", "--high-level", String(prNumber), "--reuse-slices"],
		cwd,
	};
	trackDeferredCommand(session, command);
	const label = `reopen-high-level-review #${prNumber}: session ${id}`;
	const pid = runDeferredCommand(
		{ ...command, env: workflowQueryEnv(process.env, id, undefined, cwd) },
		(result) => {
			const missing = noSavedSlices(result);
			if (!missing) {
				deliverDeferredResult(m, id, command, result);
				return reply({ ok: true });
			}
			untrackDeferredCommand(session, command);
			daemonLog(`${label} has no saved slices; nothing delivered`);
			reply({ ok: false, error: missing });
		},
		undefined,
		(output) => {
			if (output.includes(previewAwaitingMessage)) reply({ ok: true });
		},
	);
	daemonLog(`${label} started: pid ${pid ?? "none"}`);
}
