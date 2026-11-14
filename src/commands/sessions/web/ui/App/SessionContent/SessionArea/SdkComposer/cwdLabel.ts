export function cwdLabel(cwd: string | undefined): string {
	if (!cwd) return "the session directory";
	return cwd.split(/[\\/]/).filter(Boolean).at(-1) ?? cwd;
}
