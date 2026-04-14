import { buildPrompt, type SessionMode } from "./buildPrompt";

export function submitSession(
	mode: SessionMode,
	prompt: string,
	cwd: string,
	onCreate: (prompt: string, cwd: string) => void,
): void {
	onCreate(buildPrompt(mode, prompt.trim()), cwd);
}
