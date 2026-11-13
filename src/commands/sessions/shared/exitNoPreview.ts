export function exitNoPreview(error: unknown): never {
	console.error(
		`Error: ${error instanceof Error ? error.message : String(error)}`,
	);
	console.error(
		"No preview is open — nothing is awaiting approval in the preview pane. Do not tell the user to look for one; report this failure instead.",
	);
	process.exit(1);
}
