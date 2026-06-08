import chalk from "chalk";
import { emitActivity } from "../../shared/emitActivity";
import { type SpawnClaudeOptions, spawnClaude } from "../../shared/spawnClaude";
import { buildPhasePrompt } from "./buildPhasePrompt";
import { resolvePhaseResult } from "./resolvePhaseResult";
import type { BacklogItem, PlanPhase } from "./types";
import { stopWatching, watchForMarker } from "./watchForMarker";

export async function executePhase(
	item: BacklogItem,
	phaseIndex: number,
	phases: PlanPhase[],
	spawnOptions?: SpawnClaudeOptions,
	// The auto-appended review phase isn't in the authored `phases` array during
	// the authored run, so callers pass the review-inclusive total to keep the
	// count stable (e.g. 1/3, 2/3, then 3/3 for review) rather than jumping.
	totalPhases: number = phases.length,
): Promise<number> {
	const phase = phases[phaseIndex];
	const phaseNumber = phaseIndex + 1;
	console.log(
		chalk.bold(
			`\n--- Phase ${phaseNumber}/${totalPhases}: ${phase.name} ---\n`,
		),
	);

	process.env.ASSIST_SESSION_ID ??= String(process.pid);
	emitActivity({
		kind: "backlog",
		itemId: item.id,
		itemName: item.name,
		phase: phaseNumber,
		totalPhases,
	});
	const { child, done } = spawnClaude(
		buildPhasePrompt(item, phaseNumber, phase),
		spawnOptions,
	);
	watchForMarker(child);
	await done;
	stopWatching();

	return await resolvePhaseResult(phaseIndex, item.id);
}
