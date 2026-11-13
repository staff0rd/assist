const HELP_ARGS = new Set(["-h", "--help", "help"]);

export function isHelpRequested(args: readonly string[]): boolean {
	return args.some((arg) => HELP_ARGS.has(arg));
}
