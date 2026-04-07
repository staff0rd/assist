import chalk from "chalk";
import { addComment } from "./addComment";
import {
	loadAndFindItem,
	saveBacklog,
	setCurrentPhase,
	setStatus,
} from "./shared";
import type { BacklogItem } from "./types";
import { writeSignal } from "./writeSignal";

function validateRewind(
	item: BacklogItem,
	phaseIndex: number,
): string | undefined {
	if (!item.plan || item.plan.length === 0) {
		return `Item #${item.id} has no plan phases.`;
	}
	if (phaseIndex < 0 || phaseIndex >= item.plan.length) {
		return `Phase ${phaseIndex} does not exist. Valid range: 0–${item.plan.length - 1}.`;
	}
	const currentPhase = item.currentPhase ?? 0;
	if (phaseIndex >= currentPhase) {
		return `Phase ${phaseIndex} is not earlier than the current phase (${currentPhase}).`;
	}
	return undefined;
}

export function rewindPhase(
	id: string,
	phase: string,
	opts: { reason: string },
): void {
	const phaseIndex = Number.parseInt(phase, 10);

	const result = loadAndFindItem(id);
	if (!result) return;

	const { item } = result;
	const error = validateRewind(item, phaseIndex);
	if (error) {
		console.log(chalk.red(error));
		process.exitCode = 1;
		return;
	}

	const phaseName = item.plan?.[phaseIndex].name;

	addComment(
		item,
		`Rewound to phase ${phaseIndex} (${phaseName}): ${opts.reason}`,
		phaseIndex,
	);
	saveBacklog(result.items);

	setCurrentPhase(id, phaseIndex);
	setStatus(id, "in-progress");

	writeSignal("rewind", {
		itemId: Number.parseInt(id, 10),
		targetPhase: phaseIndex,
	});

	console.log(
		chalk.green(`Rewound item #${id} to phase ${phaseIndex} (${phaseName}).`),
	);
}
