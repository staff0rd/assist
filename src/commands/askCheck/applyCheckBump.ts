import { loadItem } from "../backlog/loadItem";
import { moveManualCheck } from "../backlog/moveManualCheck";
import { getReady } from "../backlog/shared";
import { CHECK_PHASE_KEY } from "../sessions/shared/askCheckInputSchema";
import type { CheckBump } from "./resolveCheckBump";

function failBump(message: string): never {
	console.error(`Error: ${message} The check was not moved.`);
	process.exit(1);
}

export async function applyCheckBump(
	bump: CheckBump,
	title: string,
	answers: Record<string, string>,
): Promise<string> {
	const targetNumber = Number(answers[CHECK_PHASE_KEY]);
	const target = bump.laterPhases.find((p) => p.number === targetNumber);
	if (!target)
		failBump(
			`the pane answered "later" without a valid later phase (${answers[CHECK_PHASE_KEY] ?? "none"}).`,
		);

	const { orm } = await getReady();
	const item = await loadItem(orm, bump.itemId);
	if (!item || (item.currentPhase ?? 1) !== bump.phaseNumber)
		failBump(`the item moved on from phase ${bump.phaseNumber}.`);

	await moveManualCheck(
		orm,
		item,
		bump.phaseNumber - 1,
		bump.checkIdx,
		target.number - 1,
	);
	return `Manual check "${title}": moved to phase ${target.number} (${target.name})`;
}
