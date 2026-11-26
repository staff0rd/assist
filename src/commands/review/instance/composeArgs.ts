export function composeArgs(
	project: string,
	composeFile: string,
	...command: string[]
): string[] {
	return ["compose", "-p", project, "-f", composeFile, ...command];
}
