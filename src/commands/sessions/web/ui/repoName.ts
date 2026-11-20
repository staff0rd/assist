export function repoName(cwd: string): string {
	const sep = cwd.includes("\\") ? "\\" : "/";
	return cwd.split(sep).filter(Boolean).pop() ?? cwd;
}
