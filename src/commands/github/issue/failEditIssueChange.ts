export function failEditIssueChange(change: string, error: unknown): never {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`Setting ${change} failed: ${message}`);
	process.exit(1);
}
