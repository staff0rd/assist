import type { RunConfigInfo } from "./types";

export function submitSession(
	prompt: string,
	cwd: string,
	onCreate: (prompt: string, cwd: string) => void,
): void {
	onCreate(prompt.trim(), cwd);
}

export function buildRunArgs(
	config: RunConfigInfo | undefined,
	values: Record<string, string>,
): string[] {
	return (config?.params ?? [])
		.map((p) => values[p.name]?.trim())
		.filter(Boolean) as string[];
}
