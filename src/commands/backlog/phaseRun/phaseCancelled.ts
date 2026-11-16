import { loadPhaseRunRow } from "./loadPhaseRunRow";

/** Whether a rewind or stop returned this phase to pending, or another session took it over; a failed phase keeps its work. */
export async function phaseCancelled(
	itemId: number,
	idx: number,
	token: string,
): Promise<boolean> {
	const row = await loadPhaseRunRow(itemId, idx);
	if (!row) return true;
	return (
		row.runState === null ||
		(row.runState === "running" && row.runToken !== token)
	);
}
