import chalk from "chalk";
import { formatItemId } from "./formatItemId";
import type { PreparedRun } from "./prepareRun";

export function logProgress({ plan, startPhase, item }: PreparedRun): void {
	console.log(
		chalk.bold(`Running plan for ${formatItemId(item.id)}: ${item.name}`),
	);
	// why: +1 for the review phase appended after the authored phases, so resuming at the review reads e.g. 2/2 rather than 2/1.
	const totalPhases = plan.length + 1;
	if (startPhase > 0) {
		const phaseNumber = startPhase + 1;
		console.log(
			chalk.dim(`Resuming from phase ${phaseNumber}/${totalPhases}\n`),
		);
	} else {
		console.log(chalk.dim(`${totalPhases} phase(s)\n`));
	}
}
