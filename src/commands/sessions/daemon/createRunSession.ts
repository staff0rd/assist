import { type ServerRunMeta, serverRunMeta } from "./serverRunMeta";
import { spawnRun } from "./spawnRun";
import { startOrHoldPty } from "./startOrHoldPty";
import type { Session } from "./types";
import { sessionBase } from "./sessionBase";

export type RunSpawnRequest = {
	runName: string;
	runArgs: string[];
	cwd?: string;
	meta?: ServerRunMeta;
};

export function createRunSession(
	id: string,
	{ runName, runArgs, cwd, meta }: RunSpawnRequest,
	hold?: boolean,
): Session {
	const serverMeta = meta ?? serverRunMeta(runName, cwd);
	return {
		...sessionBase(id, "running"),
		name: `run: ${runName}`,
		commandType: "run",
		...startOrHoldPty(
			() => spawnRun({ name: runName, args: runArgs, cwd }),
			hold,
		),
		runName,
		runArgs,
		cwd,
		server: serverMeta.server || undefined,
		serverPort: serverMeta.port,
		serverProtocol: serverMeta.protocol,
		serverPath: serverMeta.path,
		serverOrigin: serverMeta.origin,
		serverGroup: serverMeta.group,
	};
}
