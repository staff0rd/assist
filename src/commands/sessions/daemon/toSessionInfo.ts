import type { Session, SessionInfo } from "./createSession";

export function toSessionInfo({
	id,
	name,
	commandType,
	status,
	startedAt,
	runName,
	runArgs,
	cwd,
	restored,
}: Session): SessionInfo {
	return {
		id,
		name,
		commandType,
		status,
		startedAt,
		runName,
		runArgs,
		cwd,
		restored,
	};
}
