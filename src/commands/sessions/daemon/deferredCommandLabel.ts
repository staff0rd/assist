export function deferredCommandLabel(argv: string[]): string {
	const firstFlag = argv.findIndex((arg) => arg.startsWith("-"));
	return (firstFlag === -1 ? argv : argv.slice(0, firstFlag)).join(" ") || "?";
}
