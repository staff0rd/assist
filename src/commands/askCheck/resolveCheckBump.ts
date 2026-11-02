import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { loadItem } from "../backlog/loadItem";
import { resolveRewindPlan } from "../backlog/resolveRewindPlan";
import { getReady } from "../backlog/shared";
import type { LaterPhase } from "../sessions/shared/askCheckInputSchema";

export type CheckBump = {
	itemId: number;
	phaseNumber: number;
	checkIdx: number;
	laterPhases: LaterPhase[];
};

function rejectCheckIndex(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}

export async function resolveCheckBump(
	check: string | undefined,
): Promise<CheckBump | undefined> {
	if (check === undefined) return undefined;
	const checkNumber = Number(check);
	if (!Number.isInteger(checkNumber) || checkNumber < 1)
		rejectCheckIndex(`--check must be a 1-based index, got "${check}".`);
	const itemId = resolveSessionItemId();
	if (itemId === null) return undefined;
	const { orm } = await getReady();
	const item = await loadItem(orm, itemId);
	if (!item) return undefined;

	const phaseNumber = item.currentPhase ?? 1;
	const laterPhases = resolveRewindPlan(item)
		.slice(phaseNumber)
		.map((phase, i) => ({ number: phaseNumber + i + 1, name: phase.name }));
	if (laterPhases.length === 0) return undefined;

	const checkCount = item.plan?.[phaseNumber - 1]?.manualChecks?.length ?? 0;
	if (checkNumber > checkCount)
		rejectCheckIndex(
			`phase ${phaseNumber} has ${checkCount} manual check(s), so --check ${checkNumber} matches none. Pass the check's 1-based index from the phase prompt.`,
		);
	return { itemId, phaseNumber, checkIdx: checkNumber - 1, laterPhases };
}
