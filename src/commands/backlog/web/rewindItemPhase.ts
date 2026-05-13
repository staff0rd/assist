import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { addComment } from "../addComment";
import { saveBacklog } from "../shared";
import { applyCwdFromReq } from "./applyCwdFromReq";
import { findItemOr404 } from "./findItemOr404";
import { parseRewindBody } from "./parseItemBody";

export async function rewindItemPhase(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
): Promise<void> {
	const { phase, reason } = await parseRewindBody(req);
	applyCwdFromReq(req);
	const result = findItemOr404(res, id);
	if (!result) return;
	const { items, item } = result;

	const error = validateRewind(item, phase);
	if (error) {
		respondJson(res, 400, { error });
		return;
	}

	const phaseName = item.plan?.[phase - 1].name;
	addComment(
		item,
		`Rewound to phase ${phase} (${phaseName}): ${reason}`,
		phase,
	);
	item.currentPhase = phase;
	item.status = "in-progress";
	saveBacklog(items);
	respondJson(res, 200, item);
}

function validateRewind(
	item: { plan?: unknown[]; currentPhase?: number; id: number },
	phase: number,
): string | undefined {
	if (!item.plan || item.plan.length === 0) {
		return "Item has no plan phases.";
	}
	if (phase < 1 || phase > item.plan.length) {
		return `Phase ${phase} does not exist. Valid range: 1\u2013${item.plan.length}.`;
	}
	const currentPhase = item.currentPhase ?? 1;
	if (phase >= currentPhase) {
		return `Phase ${phase} is not earlier than the current phase (${currentPhase}).`;
	}
	return undefined;
}
