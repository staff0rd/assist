import { loadPhaseRunRow } from "./loadPhaseRunRow";

export async function ownsPhase(
	itemId: number,
	idx: number,
	token: string,
): Promise<boolean> {
	const row = await loadPhaseRunRow(itemId, idx);
	return row?.runState === "running" && row.runToken === token;
}
