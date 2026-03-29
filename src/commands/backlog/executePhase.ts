import chalk from "chalk";
import { buildPhasePrompt } from "./buildPhasePrompt";
import { resolvePhaseResult } from "./resolvePhaseResult";
import { spawnClaude } from "./spawnClaude";
import type { BacklogItem, PlanPhase } from "./types";
import { stopWatching, watchForMarker } from "./watchForMarker";

export async function executePhase(
	item: BacklogItem,
	phaseIndex: number,
	phases: PlanPhase[],
): Promise<number> {
	const phase = phases[phaseIndex];
	console.log(
		chalk.bold(
			`\n--- Phase ${phaseIndex + 1}/${phases.length}: ${phase.name} ---\n`,
		),
	);

	const { child, done } = spawnClaude(
		buildPhasePrompt(item, phaseIndex, phase),
	);
	watchForMarker(child);
	await done;
	stopWatching();

	const delta = await resolvePhaseResult(phaseIndex);
	return delta < 0 ? -1 : phaseIndex + delta;
}
