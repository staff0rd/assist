import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { loadItem } from "../loadItem";
import { rewindItemToPhase } from "../rewindItemToPhase";
import { parseRewindBody } from "./parseStatusBody";
import { findItemOr404 } from "./shared";

export async function rewindItemPhase(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
): Promise<void> {
	const { phase, reason } = await parseRewindBody(req);
	const result = await findItemOr404(res, id);
	if (!result) return;
	const { orm, item } = result;

	const outcome = await rewindItemToPhase(orm, item, phase, reason);
	if (!outcome.ok) {
		respondJson(res, 400, { error: outcome.error });
		return;
	}
	respondJson(res, 200, await loadItem(orm, id));
}
