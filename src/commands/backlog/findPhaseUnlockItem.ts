import chalk from "chalk";
import { formatItemId } from "./formatItemId";
import { findOneItem } from "./shared";

type PhaseUnlockItem = NonNullable<Awaited<ReturnType<typeof findOneItem>>> & {
	label: string;
};

export async function findPhaseUnlockItem(
	itemId: number,
	phase: number,
): Promise<PhaseUnlockItem | undefined> {
	const found = await findOneItem(String(itemId));
	if (!found) {
		process.exitCode = 1;
		return undefined;
	}

	const label = `${formatItemId(itemId)} ${found.item.name}`;
	if ((found.item.currentPhase ?? 1) !== phase) {
		console.error(
			chalk.red(
				`${label} has moved on from phase ${phase} since the unlock was requested. Nothing was approved; request a new unlock from the current phase.`,
			),
		);
		process.exitCode = 1;
		return undefined;
	}
	return { ...found, label };
}
