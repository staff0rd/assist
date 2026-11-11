import { isDaemonRunning } from "../daemon/connectToDaemon";
import { sendToDaemonAwaitAck } from "../daemon/sendToDaemonAwaitAck";

export type ReloadLinksResult =
	| { kind: "reloaded" }
	| { kind: "not-running" }
	| { kind: "failed"; message: string };

export async function reloadDaemonLinks(): Promise<ReloadLinksResult> {
	if (!(await isDaemonRunning())) return { kind: "not-running" };
	try {
		await sendToDaemonAwaitAck({ type: "reload-links" });
		return { kind: "reloaded" };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return { kind: "failed", message };
	}
}
