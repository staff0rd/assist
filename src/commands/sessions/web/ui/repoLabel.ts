export function repoLabel(cwd?: string): string {
	if (!cwd) return "";
	const segments = cwd.split(/[/\\]/).filter(Boolean);
	return segments[segments.length - 1] ?? "";
}
