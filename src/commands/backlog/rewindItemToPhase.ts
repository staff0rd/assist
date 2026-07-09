import type { Db } from "../../shared/db/Db";
import { appendComment } from "./appendComment";
import { resolveRewindPlan } from "./resolveRewindPlan";
import type { BacklogItem } from "./types";
import { updateCurrentPhase } from "./updateCurrentPhase";
import { updateStatus } from "./updateStatus";
import { writeSignal } from "./writeSignal";

type RewindResult =
	| { ok: true; phaseName: string }
	| { ok: false; error: string };

export async function rewindItemToPhase(
	orm: Db,
	item: BacklogItem,
	phaseNumber: number,
	reason: string,
): Promise<RewindResult> {
	const plan = resolveRewindPlan(item);
	if (phaseNumber < 1 || phaseNumber > plan.length) {
		return {
			ok: false,
			error: `Phase ${phaseNumber} does not exist. Valid range: 1–${plan.length}.`,
		};
	}
	const currentPhase = item.currentPhase ?? 1;
	if (phaseNumber >= currentPhase) {
		return {
			ok: false,
			error: `Phase ${phaseNumber} is not earlier than the current phase (${currentPhase}).`,
		};
	}

	const phaseName = plan[phaseNumber - 1].name;
	await appendComment(
		orm,
		item.id,
		`Rewound to phase ${phaseNumber} (${phaseName}): ${reason}`,
		{ phase: phaseNumber },
	);
	await updateCurrentPhase(orm, item.id, phaseNumber);
	await updateStatus(orm, item.id, "in-progress");

	writeSignal("rewind", { itemId: item.id, targetPhase: phaseNumber - 1 });

	return { ok: true, phaseName };
}
