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
}: Session): SessionInfo {
	return { id, name, commandType, status, startedAt, runName, runArgs, cwd };
}
