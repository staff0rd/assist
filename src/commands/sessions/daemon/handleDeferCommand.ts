import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { deferredCommandEnv } from "./deferredCommandEnv";
import { deferredCommandLabel } from "./deferredCommandLabel";
import type { Handler } from "./routed";
import { refuseConflictingPreview } from "./refuseConflictingPreview";
import { runDeferredCommand } from "./runDeferredCommand";
import { trackDeferredCommand } from "./trackDeferredCommand";
import { deliverDeferredResult } from "./deliverDeferredResult";

export const handleDeferCommand: Handler = (client, m, d) => {
	const id = String(d.sessionId);
	const argv = Array.isArray(d.argv) ? d.argv.map(String) : [];
	const label = deferredCommandLabel(argv);
	if (argv.length === 0) {
		daemonLog(`defer-command declined: session ${id} sent an empty argv`);
		sendTo(client, { type: "defer-command-result", accepted: false });
		return;
	}
	const session = m.session(id);
	if (!session?.pty || session.status === "done") {
		daemonLog(
			`defer-command ${label} declined: session ${id} is not a live session`,
		);
		sendTo(client, { type: "defer-command-result", accepted: false });
		return;
	}
	if (refuseConflictingPreview(session, client, d, label)) return;
	const env = (d.env ?? {}) as Record<string, string>;
	const command = {
		argv,
		previewKey: typeof d.previewKey === "string" ? d.previewKey : undefined,
		stdin: typeof d.stdin === "string" ? d.stdin : undefined,
		cwd: String(d.cwd),
		env: deferredCommandEnv(env),
	};
	trackDeferredCommand(session, command);
	const pid = runDeferredCommand({ ...command, env }, (result) =>
		deliverDeferredResult(m, id, command, result),
	);
	daemonLog(
		`defer-command ${label} started: session ${id} pid ${pid ?? "none"}`,
	);
	sendTo(client, { type: "defer-command-result", accepted: true });
};
