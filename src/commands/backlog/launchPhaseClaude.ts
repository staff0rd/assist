import { awaitClaude } from "../../shared/awaitClaude";
import { type SpawnClaudeOptions, spawnClaude } from "../../shared/spawnClaude";
import { stopWatching, watchForMarker } from "./watchForMarker";

export async function launchPhaseClaude(
	prompt: string,
	spawnOptions: SpawnClaudeOptions,
	context: string,
): Promise<number | null> {
	const { child, done } = spawnClaude(prompt, spawnOptions);
	watchForMarker(child);
	const exitCode = await awaitClaude(done, context);
	stopWatching();
	return exitCode;
}
