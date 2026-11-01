type BacklogRunCandidate = {
	commandType?: string;
	assistArgs?: string[];
};

export function backlogRunArgs(
	session: BacklogRunCandidate,
): string[] | undefined {
	const args = session.assistArgs;
	if (session.commandType !== "assist" || !args) return undefined;
	if (args[0] !== "backlog" || args[1] !== "run" || !args[2]) return undefined;
	return args;
}
