export function composerPlaceholder(
	shell: boolean,
	suggestion: string | undefined,
	fallback: string,
): string {
	if (shell) return "Shell command";
	return suggestion ?? fallback;
}
