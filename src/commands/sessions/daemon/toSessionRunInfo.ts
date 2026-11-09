import type { Session } from "./createSession";
import { originForCwd } from "./originForCwd";

export function toSessionRunInfo({
	status,
	startedAt,
	runningMs,
	runningSince,
	waitingSince,
	runName,
	runArgs,
	server,
	serverPort,
	serverProtocol,
	serverPath,
	serverOrigin,
	assistArgs,
	cwd,
	activity,
	usedPct,
	error,
	closing,
}: Session) {
	return {
		status,
		startedAt,
		runningMs,
		runningSince,
		waitingSince,
		runName,
		runArgs,
		server,
		port: serverPort,
		protocol: serverProtocol,
		urlPath: serverPath,
		remoteOrigin: serverOrigin ?? originForCwd(cwd),
		assistArgs,
		activity,
		usedPct,
		error,
		closing,
	};
}
