import type { Session, SessionInfo } from "./createSession";

export function toSessionInfo({
	id,
	name,
	title,
	subtitle,
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
<<<<<<< Updated upstream
	totalIn,
	totalOut,
=======
	starred,
>>>>>>> Stashed changes
}: Session): SessionInfo {
	return {
		id,
		name,
		title,
		subtitle,
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
<<<<<<< Updated upstream
		totalIn,
		totalOut,
=======
		starred,
>>>>>>> Stashed changes
	};
}
