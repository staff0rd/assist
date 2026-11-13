export function isStatusLineInvocation(argv: readonly string[]): boolean {
	return argv.length === 3 && argv[2] === "status-line";
}
