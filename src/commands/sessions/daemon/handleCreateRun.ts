import { type SessionClient, sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { serverConflictInfo } from "./serverConflictInfo";
import { serverRunMeta } from "./serverRunMeta";
import type { SessionManager } from "./SessionManager";
import { spawnContextFrom } from "./spawnContextFrom";

export function handleCreateRun(
	client: SessionClient,
	m: SessionManager,
	d: Record<string, unknown>,
): void {
	if (m.windowsProxy.route(client, d)) return;
	const runName = d.runName as string;
	const cwd = d.cwd as string | undefined;
	const runArgs = (d.runArgs as string[]) ?? [];
	const context = spawnContextFrom(d);
	const meta = serverRunMeta(runName, cwd);
	if (meta.server && meta.origin && meta.group) {
		const existing = m.liveServerRun(meta.origin, meta.group);
		if (existing && d.replace !== true) {
			daemonLog(
				`create-run ${runName} rejected: server ${existing.id} already live for ${meta.origin} (${meta.group})`,
			);
			sendTo(client, {
				type: "run-conflict",
				runName,
				cwd,
				launchedFrom: context.launchedFrom,
				existing: serverConflictInfo(existing),
			});
			return;
		}
		if (existing) {
			daemonLog(
				`create-run ${runName} replacing live server ${existing.id} for ${meta.origin} (${meta.group})`,
			);
			m.dismissSession(existing.id);
		}
	}
	sendTo(client, {
		type: "created",
		sessionId: m.spawnRun({ runName, runArgs, cwd, meta }, context),
		isNew: true,
	});
}
