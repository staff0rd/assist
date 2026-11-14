import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { deferredCommandLabel } from "./deferredCommandLabel";
import type { Handler } from "./routed";
import { runDeferredCommand } from "./runDeferredCommand";
import { trackDeferredCommand } from "./trackDeferredCommand";
import { deliverDeferredResult } from "./deliverDeferredResult";

export const handleDeferCommand: Handler = (client, m, d) => {
	const id = String(d.sessionId);
	const argv = Array.isArray(d.argv) ? d.argv.map(String) : [];
	const label = deferredCommandLabel(argv);
	const session = m.session(id);
	if (!session?.pty?.sdk) {
		daemonLog(
			`defer-command ${label} declined: session ${id} is not a live Claude (SDK) session`,
		);
		sendTo(client, { type: "defer-command-result", accepted: false });
		return;
	}
	const command = {
		argv,
		stdin: typeof d.stdin === "string" ? d.stdin : undefined,
		cwd: String(d.cwd),
	};
	trackDeferredCommand(session, command);
	const pid = runDeferredCommand(
		{ ...command, env: (d.env ?? {}) as Record<string, string> },
		(result) => deliverDeferredResult(m, id, command, result),
	);
	daemonLog(
		`defer-command ${label} started: session ${id} pid ${pid ?? "none"}`,
	);
	sendTo(client, { type: "defer-command-result", accepted: true });
};
