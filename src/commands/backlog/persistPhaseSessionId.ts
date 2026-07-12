import { recordPhaseSessionId } from "../../shared/db/recordPhaseSessionId";
import { getReady } from "./shared";

export async function persistPhaseSessionId(
	itemId: number,
	phaseIdx: number,
	claudeSessionId: string,
): Promise<void> {
	try {
		const { orm } = await getReady();
		await recordPhaseSessionId(orm, itemId, phaseIdx, claudeSessionId);
	} catch {}
}
