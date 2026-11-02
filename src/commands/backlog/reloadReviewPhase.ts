import { buildReviewPhase } from "./buildReviewPhase";
import { resolveReviewPhase } from "./resolveReviewPhase";
import { findOneItem } from "./shared";
import type { PlanPhase } from "./types";

export async function reloadReviewPhase(id: number): Promise<PlanPhase> {
	const found = await findOneItem(String(id));
	return found ? resolveReviewPhase(found.item) : buildReviewPhase();
}
