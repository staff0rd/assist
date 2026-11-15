import chalk from "chalk";
import { formatItemId } from "../formatItemId";
import { phaseAlreadyDone } from "./phaseAlreadyDone";
import { ownsPhase } from "./watchPhaseCancel";

/** The result a parallel phase session ends with before starting, or undefined when it should run. */
export async function phaseStartRefusal(
	itemId: number,
	phaseNumber: number,
	token: string,
): Promise<boolean | undefined> {
	const idx = phaseNumber - 1;
	const label = `Phase ${phaseNumber} of ${formatItemId(itemId)}`;
	if (await phaseAlreadyDone(itemId, idx)) {
		console.log(chalk.green(`${label} is already done and landed.`));
		return true;
	}
	if (await ownsPhase(itemId, idx, token)) return undefined;
	console.log(
		chalk.yellow(
			`${label} is no longer assigned to this session (rewound or superseded).`,
		),
	);
	return false;
}
