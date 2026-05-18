import chalk from "chalk";
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
): Promise<number> {
	const phase = phases[phaseIndex];
	const phaseNumber = phaseIndex + 1;
	console.log(
		chalk.bold(
			`\n--- Phase ${phaseNumber}/${phases.length}: ${phase.name} ---\n`,
		),
	);

	process.env.ASSIST_SESSION_ID = String(process.pid);
	const { child, done } = spawnClaude(
		buildPhasePrompt(item, phaseNumber, phase),
		spawnOptions,
	);
	watchForMarker(child);
	await done;
	stopWatching();

	return await resolvePhaseResult(phaseIndex, item.id);
}
