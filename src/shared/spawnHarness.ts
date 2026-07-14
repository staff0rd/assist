import type { HarnessKind } from "./harnesses";
import { spawnClaude } from "./spawnClaude";
import { spawnCodex } from "./spawnCodex";
import type { SpawnResult } from "./spawnInherit";

type SpawnHarnessOptions = {
	sessionId?: string;
	resumeSessionId?: string;
	cwd?: string;
};

export function spawnHarness(
	harness: HarnessKind,
	prompt: string,
	options: SpawnHarnessOptions = {},
): SpawnResult {
	if (harness === "codex") {
		return spawnCodex(prompt, { cwd: options.cwd });
	}
	return spawnClaude(prompt, {
		allowEdits: true,
		sessionId: options.sessionId,
		resumeSessionId: options.resumeSessionId,
	});
}
