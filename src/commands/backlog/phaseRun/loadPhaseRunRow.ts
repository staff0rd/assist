import { getReady } from "../shared";
import { loadPhaseRunRows } from "./loadPhaseProgress";

export async function loadPhaseRunRow(itemId: number, idx: number) {
	const { orm } = await getReady();
	return (await loadPhaseRunRows(orm, itemId)).find((r) => r.idx === idx);
}
