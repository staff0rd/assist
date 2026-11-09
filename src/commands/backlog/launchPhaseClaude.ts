import { awaitHarness } from "../../shared/awaitHarness";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import type { HarnessKind } from "../../shared/harnesses";
import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import { stopWatching, watchForMarker } from "./watchForMarker";

export async function launchPhaseClaude(
	prompt: string,
	spawnOptions: SpawnClaudeOptions,
	context: string,
	harness?: HarnessKind,
): Promise<number | null> {
	const adapter = harnessAdapter(harness);
	const cwd = process.cwd();
	const { allowEdits, resumeSessionId, sessionId } = spawnOptions;
	const { child, done } = resumeSessionId
		? adapter.resume(resumeSessionId, prompt, { cwd, allowEdits })
		: adapter.launchPrompt(prompt, {
				cwd,
				allowEdits,
				conversationId: sessionId,
			});
	watchForMarker(child);
	const exitCode = await awaitHarness(done, context, adapter.label);
	stopWatching();
	return exitCode;
}
