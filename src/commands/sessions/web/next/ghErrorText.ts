export function ghErrorText(error: unknown): string {
	const stderr = (error as { stderr?: unknown }).stderr;
	if (typeof stderr === "string" && stderr.trim()) return stderr.trim();
	return error instanceof Error ? error.message : String(error);
}
