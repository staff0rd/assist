import chalk from "chalk";
import { formatItemId } from "./formatItemId";
import { rewindItemToPhase } from "./rewindItemToPhase";
import { findOneItem } from "./shared";

export async function rewindPhase(
	id: string,
	phase: string,
	opts: { reason: string },
): Promise<void> {
	const phaseNumber = Number.parseInt(phase, 10);

	const found = await findOneItem(id);
	if (!found) return;
	const { orm, item } = found;

	const result = await rewindItemToPhase(orm, item, phaseNumber, opts.reason);
	if (!result.ok) {
		console.log(chalk.red(result.error));
		process.exitCode = 1;
		return;
	}

	console.log(
		chalk.green(
			`Rewound item ${formatItemId(item.id)} to phase ${phaseNumber} (${result.phaseName}).`,
		),
	);
}
