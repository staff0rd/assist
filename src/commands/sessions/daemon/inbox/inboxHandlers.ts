import { harnessKindOf } from "../../../../shared/harnessKindOf";
import { inboxScanBlocker } from "../../../inbox/inboxScanBlocker";
import { sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { Handler } from "../routed";
import { inboxScanner } from "./inboxScanner";

export const inboxHandlers: Record<string, Handler> = {
	"inbox-status": (client) =>
		sendTo(client, { type: "inbox-status", ...inboxScanner.status() }),
	"inbox-scan": (client, _manager, data) => {
		const harness = harnessKindOf(data.harness);
		const blocker = inboxScanBlocker(harness);
		if (blocker) {
			daemonLog(`inbox: scan refused before spawning: ${blocker}`);
			sendTo(client, { type: "inbox-scan", started: false, error: blocker });
			return;
		}
		const started = inboxScanner.scanNow(harness);
		if (!started) daemonLog("inbox: scan requested while one is running");
		sendTo(client, { type: "inbox-scan", started });
	},
};
