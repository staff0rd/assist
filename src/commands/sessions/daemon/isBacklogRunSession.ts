export function isBacklogRunSession(session: {
	commandType: string;
	assistArgs?: string[];
}): boolean {
	return hasAssistArgs(session, "run");
}

export function isRunPhaseSession(session: {
	commandType: string;
	assistArgs?: string[];
}): boolean {
	return hasAssistArgs(session, "run-phase");
}

function hasAssistArgs(
	session: { commandType: string; assistArgs?: string[] },
	subcommand: string,
): boolean {
	return (
		session.commandType === "assist" &&
		session.assistArgs?.[0] === "backlog" &&
		session.assistArgs[1] === subcommand
	);
}
