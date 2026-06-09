import type { Session, SessionInfo } from "./createSession";

export function toSessionInfo({
	id,
	name,
	commandType,
	status,
	startedAt,
	runName,
	runArgs,
	assistArgs,
	cwd,
	restored,
	activity,
	autoRun,
}: Session): SessionInfo {
	return {
		id,
		name,
		commandType,
		status,
		startedAt,
		runName,
		runArgs,
		assistArgs,
		cwd,
		restored,
		activity,
		autoRun,
	};
}
