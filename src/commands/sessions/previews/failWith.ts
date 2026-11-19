export function failWith(error: unknown): void {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
}
