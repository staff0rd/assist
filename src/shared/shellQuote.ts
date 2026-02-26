export function shellQuote(arg: string): string {
	if (/[^a-zA-Z0-9_./:=@%^+,-]/.test(arg)) {
		if (process.platform === "win32") {
			return `"${arg.replace(/"/g, '\\"')}"`;
		}
		return `'${arg.replace(/'/g, "'\\''")}'`;
	}
	return arg;
}
