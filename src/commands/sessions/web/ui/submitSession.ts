import { buildPrompt, type SessionMode } from "./buildPrompt";
import type { RunConfigInfo } from "./types";

export function submitSession(
	mode: SessionMode,
	prompt: string,
	cwd: string,
	onCreate: (prompt: string, cwd: string) => void,
): void {
	onCreate(buildPrompt(mode, prompt.trim()), cwd);
}

export function buildRunArgs(
	config: RunConfigInfo | undefined,
	values: Record<string, string>,
): string[] {
	return (config?.params ?? [])
		.map((p) => values[p.name]?.trim())
		.filter(Boolean) as string[];
}
