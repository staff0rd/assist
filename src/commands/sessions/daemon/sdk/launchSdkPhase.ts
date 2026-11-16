import type { SessionProcess } from "../../../../shared/harnessAdapters/types";
import type { SessionClient } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { Msg } from "../routed";
import type { SessionManager } from "../SessionManager";
import { runPhaseBoundaryTransfer } from "../transfer/runPhaseBoundaryTransfer";
import { drivenLaunchTarget } from "./drivenLaunchTarget";
import { linkWorkflowQuery } from "./linkWorkflowQuery";
import { refuseSdkLaunch } from "./refuseSdkLaunch";
import { sdkLaunchOpts } from "./sdkLaunchOpts";

export function launchSdkPhase(
	client: SessionClient,
	m: SessionManager,
	d: Msg,
): void {
	const sessionId = String(d.sessionId);
	const { harness, label, drivenSession } = drivenLaunchTarget(d.harness);
	const refuse = (reason: string) =>
		refuseSdkLaunch(client, sessionId, label, reason);
	if (!drivenSession)
		return refuse(
			`named ${harness ?? "no harness"}, which does not run daemon-driven sessions`,
		);
	const session = m.session(sessionId);
	const attach = session?.pty?.sdk?.attach;
	if (!attach)
		return refuse(
			session ? "is not a driven workflow session" : "was not found",
		);
	const opts = sdkLaunchOpts(d, sessionId);
	daemonLog(
		`session ${sessionId} sdk-launch received: ${harness}, ${opts.resumeId ? `resume ${opts.resumeId}` : `conversation ${opts.conversationId ?? "unassigned"}`}${opts.prompt ? "" : ", no prompt"}`,
	);
	let query: SessionProcess;
	try {
		query = drivenSession(opts);
	} catch (error) {
		return refuse(error instanceof Error ? error.message : String(error));
	}
	attach(query, !opts.prompt);
	linkWorkflowQuery(client, sessionId, query, () => {
		const s = m.session(sessionId);
		if (s) runPhaseBoundaryTransfer(m, s);
	});
}
