import { daemonLog } from "../daemonLog";
import { isSdkSession } from "../isSdkSession";
import { routed } from "../routed";
import { runSdkShell } from "./runSdkShell";

const ENDED = new Set(["done", "stopped", "error"]);

export const handleSdkShell = routed((_client, m, d) => {
	const id = String(d.sessionId);
	const command = String(d.command ?? "").trim();
	const session = m.session(id);
	if (!session || !isSdkSession(session) || ENDED.has(session.status)) {
		daemonLog(
			`sdk-shell ignored: session ${id} ${session ? "is not a live Claude (SDK) session" : "was not found"}`,
		);
		return;
	}
	if (!command) {
		daemonLog(`sdk-shell ignored: session ${id} sent an empty command`);
		return;
	}
	daemonLog(`sdk-shell received: session ${id}`);
	runSdkShell(session, command, () => m.update(() => true));
});
