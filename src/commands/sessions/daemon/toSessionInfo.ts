import type { Session, SessionInfo } from "./createSession";

export function toSessionInfo({
	id,
	name,
	commandType,
	status,
	startedAt,
	runningMs,
	runningSince,
	runName,
	runArgs,
	assistArgs,
	cwd,
	restored,
	error,
	activity,
	autoRun,
	autoAdvance,
}: Session): SessionInfo {
	return {
		id,
		name,
		commandType,
		status,
		startedAt,
		runningMs,
		runningSince,
		runName,
		runArgs,
		assistArgs,
		cwd,
		restored,
		error,
		activity,
		autoRun,
		autoAdvance,
	};
}
