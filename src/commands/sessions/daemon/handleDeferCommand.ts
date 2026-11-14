import { supersededPreviewMessage } from "../shared/supersededPreviewMessage";
import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { formatDeferredResult } from "./formatDeferredResult";
import type { Handler } from "./routed";
import { type DeferredResult, runDeferredCommand } from "./runDeferredCommand";
import type { SessionManager } from "./SessionManager";

function deliver(
	m: SessionManager,
	id: string,
	command: string,
	result: DeferredResult,
): void {
	const label = `defer-command ${command}: session ${id} exit ${result.exitCode}`;
	if (
		result.exitCode === 0 &&
		result.output.includes(supersededPreviewMessage)
	) {
		daemonLog(`${label} superseded; nothing delivered`);
		return;
	}
	const sdk = m.session(id)?.pty?.sdk;
	if (!sdk) {
		daemonLog(`${label} dropped: session is gone`);
		return;
	}
	sdk.send(formatDeferredResult(command, result));
	daemonLog(`${label} delivered as the next message`);
}

export const handleDeferCommand: Handler = (client, m, d) => {
	const id = String(d.sessionId);
	const argv = Array.isArray(d.argv) ? d.argv.map(String) : [];
	const command = argv[0] ?? "?";
	if (!m.session(id)?.pty?.sdk) {
		daemonLog(
			`defer-command ${command} declined: session ${id} is not a live Claude (SDK) session`,
		);
		sendTo(client, { type: "defer-command-result", accepted: false });
		return;
	}
	const pid = runDeferredCommand(
		{
			argv,
			stdin: typeof d.stdin === "string" ? d.stdin : undefined,
			cwd: String(d.cwd),
			env: (d.env ?? {}) as Record<string, string>,
		},
		(result) => deliver(m, id, command, result),
	);
	daemonLog(
		`defer-command ${command} started: session ${id} pid ${pid ?? "none"}`,
	);
	sendTo(client, { type: "defer-command-result", accepted: true });
};
