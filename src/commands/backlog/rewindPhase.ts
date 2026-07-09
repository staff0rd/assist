import chalk from "chalk";
import { loadItem } from "./loadItem";
import { rewindItemToPhase } from "./rewindItemToPhase";
import { getReady } from "./shared";

export async function rewindPhase(
	id: string,
	phase: string,
	opts: { reason: string },
): Promise<void> {
	const phaseNumber = Number.parseInt(phase, 10);

	const { orm } = await getReady();
	const item = await loadItem(orm, Number.parseInt(id, 10));
	if (!item) {
		console.log(chalk.red(`Item #${id} not found.`));
		return;
	}

	const result = await rewindItemToPhase(orm, item, phaseNumber, opts.reason);
	if (!result.ok) {
		console.log(chalk.red(result.error));
		process.exitCode = 1;
		return;
	}

	console.log(
		chalk.green(
			`Rewound item #${id} to phase ${phaseNumber} (${result.phaseName}).`,
		),
	);
}
