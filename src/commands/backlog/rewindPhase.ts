import chalk from "chalk";
import { appendComment } from "./appendComment";
import { loadItem } from "./loadItem";
import { getReady, setCurrentPhase, setStatus } from "./shared";
import type { BacklogItem } from "./types";
import { writeSignal } from "./writeSignal";

function validateRewind(
	item: BacklogItem,
	phaseNumber: number,
): string | undefined {
	if (!item.plan || item.plan.length === 0) {
		return `Item #${item.id} has no plan phases.`;
	}
	if (phaseNumber < 1 || phaseNumber > item.plan.length) {
		return `Phase ${phaseNumber} does not exist. Valid range: 1–${item.plan.length}.`;
	}
	const currentPhase = item.currentPhase ?? 1;
	if (phaseNumber >= currentPhase) {
		return `Phase ${phaseNumber} is not earlier than the current phase (${currentPhase}).`;
	}
	return undefined;
}

export async function rewindPhase(
	id: string,
	phase: string,
	opts: { reason: string },
): Promise<void> {
	const phaseNumber = Number.parseInt(phase, 10);
	const phaseIndex = phaseNumber - 1;

	const { orm } = await getReady();
	const item = await loadItem(orm, Number.parseInt(id, 10));
	if (!item) {
		console.log(chalk.red(`Item #${id} not found.`));
		return;
	}

	const error = validateRewind(item, phaseNumber);
	if (error) {
		console.log(chalk.red(error));
		process.exitCode = 1;
		return;
	}

	const phaseName = item.plan?.[phaseIndex].name;

	await appendComment(
		orm,
		item.id,
		`Rewound to phase ${phaseNumber} (${phaseName}): ${opts.reason}`,
		{ phase: phaseNumber },
	);

	await setCurrentPhase(id, phaseNumber);
	await setStatus(id, "in-progress");

	writeSignal("rewind", {
		itemId: Number.parseInt(id, 10),
		targetPhase: phaseIndex,
	});

	console.log(
		chalk.green(`Rewound item #${id} to phase ${phaseNumber} (${phaseName}).`),
	);
}
