import os from "node:os";
import { recordPhaseSession } from "../../shared/db/recordPhaseSession";
import { getReady } from "./shared";

export async function persistPhaseSession(
	itemId: number,
	phaseIdx: number,
	claudeSessionId: string,
): Promise<void> {
	try {
		const { orm } = await getReady();
		await recordPhaseSession(
			orm,
			itemId,
			phaseIdx,
			claudeSessionId,
			os.hostname(),
			os.userInfo().username,
		);
	} catch (error) {
		console.error(
			`Failed to record phase session for item ${itemId} phase ${phaseIdx}:`,
			error,
		);
	}
}
