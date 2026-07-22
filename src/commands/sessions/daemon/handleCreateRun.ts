import { type SessionClient, sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { serverConflictInfo } from "./serverConflictInfo";
import { serverRunMeta } from "./serverRunMeta";
import type { SessionManager } from "./SessionManager";

export function handleCreateRun(
	client: SessionClient,
	m: SessionManager,
	d: Record<string, unknown>,
): void {
	if (m.windowsProxy.route(client, d)) return;
	const runName = d.runName as string;
	const cwd = d.cwd as string | undefined;
	const runArgs = (d.runArgs as string[]) ?? [];
	const meta = serverRunMeta(runName, cwd);
	if (meta.server && meta.origin) {
		const existing = m.liveServerRun(meta.origin);
		if (existing && d.replace !== true) {
			daemonLog(
				`create-run ${runName} rejected: server ${existing.id} already live for ${meta.origin}`,
			);
			sendTo(client, {
				type: "run-conflict",
				runName,
				cwd,
				existing: serverConflictInfo(existing),
			});
			return;
		}
		if (existing) {
			daemonLog(
				`create-run ${runName} replacing live server ${existing.id} for ${meta.origin}`,
			);
			m.dismissSession(existing.id);
		}
	}
	sendTo(client, {
		type: "created",
		sessionId: m.spawnRun(runName, runArgs, cwd, meta),
		isNew: true,
	});
}
