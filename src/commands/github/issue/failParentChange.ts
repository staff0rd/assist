export function failParentChange(child: string, error: unknown): never {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`Setting the parent of ${child} failed: ${message}`);
	process.exit(1);
}
