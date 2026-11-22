import type { Db } from "../../shared/db/Db";
import { appendManualChecks } from "./appendManualChecks";
import type { BacklogItem } from "./types";
import { setManualChecks } from "./setManualChecks";

export async function moveManualCheck(
	orm: Db,
	item: BacklogItem,
	fromIdx: number,
	checkIdx: number,
	toIdx: number,
): Promise<void> {
	const plan = item.plan ?? [];
	const from = [...(plan[fromIdx]?.manualChecks ?? [])];
	const [check] = from.splice(checkIdx, 1);
	if (check === undefined) throw new Error(`No manual check ${checkIdx + 1}`);

	await orm.transaction(async (tx) => {
		await setManualChecks(tx, item.id, fromIdx, from);
		await appendManualChecks(tx, item.id, toIdx, plan[toIdx], [check]);
	});
}
