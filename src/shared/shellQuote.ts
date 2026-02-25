export function shellQuote(arg: string): string {
	if (/[^a-zA-Z0-9_./:=@%^+,-]/.test(arg)) {
		return `'${arg.replace(/'/g, "'\\''")}'`;
	}
	return arg;
}
