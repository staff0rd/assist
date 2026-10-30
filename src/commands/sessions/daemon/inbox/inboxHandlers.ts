import { sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { Handler } from "../routed";
import { inboxScanner } from "./inboxScanner";

export const inboxHandlers: Record<string, Handler> = {
	"inbox-status": (client) =>
		sendTo(client, { type: "inbox-status", ...inboxScanner.status() }),
	"inbox-scan": (client) => {
		const started = inboxScanner.scanNow();
		if (!started) daemonLog("inbox: scan requested while one is running");
		sendTo(client, { type: "inbox-scan", started });
	},
};
