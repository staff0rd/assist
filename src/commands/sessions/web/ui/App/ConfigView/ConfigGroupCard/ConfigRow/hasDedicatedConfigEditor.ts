const KEYS = new Set(["worktree.install"]);

export function hasDedicatedConfigEditor(key: string): boolean {
	return KEYS.has(key);
}
