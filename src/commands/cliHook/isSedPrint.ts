const QUIET_LONG = new Set(["--quiet", "--silent"]);

function isShortFlagWith(token: string, letter: string): boolean {
	return /^-[a-zA-Z]+$/.test(token) && token.includes(letter);
}

function hasWriteCommand(args: string[]): boolean {
	return args.some((arg) => /[wW]$/.test(arg));
}

export function isSedPrint(command: string): boolean {
	const [name, ...args] = command.split(/\s+/);
	if (name !== "sed") return false;
	const quiet = args.some(
		(arg) => QUIET_LONG.has(arg) || isShortFlagWith(arg, "n"),
	);
	const inPlace = args.some(
		(arg) => arg.startsWith("--in-place") || isShortFlagWith(arg, "i"),
	);
	return quiet && !inPlace && !hasWriteCommand(args);
}
