import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { findPortHolderPid } from "./findPortHolderPid";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";
import { runningSession } from "./runningSession";
import { serverRunMeta } from "./serverRunMeta";
import { spawnRun } from "./spawnRun";
import { startOrHoldPty } from "./startOrHoldPty";

type RestoreBase = ReturnType<typeof restoreBase>;

export function restoreServerRun(
	id: string,
	persisted: PersistedSession,
	base: RestoreBase,
): Session | null {
	const { runName } = persisted;
	if (persisted.commandType !== "run" || !runName) return null;
	const meta = serverRunMeta(runName, persisted.cwd);
	if (!meta.server) return null;
	daemonLog(
		`relaunching server run session ${id} ("${persisted.name}") for ${meta.origin} (${meta.group})`,
	);
	const holder = meta.port ? findPortHolderPid(meta.port) : undefined;
	if (holder !== undefined)
		daemonLog(
			`session ${id} ("${persisted.name}") waiting for port ${meta.port} (held by pid ${holder}) to free before relaunching`,
		);
	const { pty, pendingStart } = startOrHoldPty(
		() =>
			spawnRun({ name: runName, args: persisted.runArgs, cwd: persisted.cwd }),
		holder !== undefined,
	);
	return {
		...runningSession(base, persisted, pty),
		pendingStart,
		scrollback:
			holder === undefined
				? base.scrollback
				: `Waiting for port ${meta.port} (held by pid ${holder}) to free…\r\n`,
		runName,
		runArgs: persisted.runArgs,
		server: true,
		serverPort: meta.port,
		serverProtocol: meta.protocol,
		serverOrigin: meta.origin,
		serverGroup: meta.group,
	};
}
