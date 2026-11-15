const RESUME_SESSION_COMMANDS = new Set([
	"draft",
	"feat",
	"bug",
	"refine",
	"fix-conflict",
	"review-pr-comments",
]);

export function acceptsResumeSession(assistArgs: string[]): boolean {
	const [command, subcommand] = assistArgs;
	if (!command) return false;
	if (command === "backlog")
		return subcommand === "run" || subcommand === "run-phase";
	return RESUME_SESSION_COMMANDS.has(command);
}
