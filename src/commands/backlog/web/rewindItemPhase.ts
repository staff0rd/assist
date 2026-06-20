import type { IncomingMessage, ServerResponse } from "node:http";
import { eq } from "drizzle-orm";
import { items } from "../../../shared/db/schema";
import { respondJson } from "../../../shared/web";
import { appendComment } from "../appendComment";
import { loadItem } from "../loadItem";
import { resolveRewindPlan } from "../resolveRewindPlan";
import type { BacklogItem, PlanPhase } from "../types";
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

	const plan = resolveRewindPlan(item);
	const error = validateRewind(item, plan, phase);
	if (error) {
		respondJson(res, 400, { error });
		return;
	}

	const phaseName = plan[phase - 1].name;
	await appendComment(
		orm,
		id,
		`Rewound to phase ${phase} (${phaseName}): ${reason}`,
		{ phase },
	);
	await orm
		.update(items)
		.set({ currentPhase: phase, status: "in-progress" })
		.where(eq(items.id, id));
	respondJson(res, 200, await loadItem(orm, id));
}

function validateRewind(
	item: BacklogItem,
	plan: PlanPhase[],
	phase: number,
): string | undefined {
	if (phase < 1 || phase > plan.length) {
		return `Phase ${phase} does not exist. Valid range: 1–${plan.length}.`;
	}
	const currentPhase = item.currentPhase ?? 1;
	if (phase >= currentPhase) {
		return `Phase ${phase} is not earlier than the current phase (${currentPhase}).`;
	}
	return undefined;
}
