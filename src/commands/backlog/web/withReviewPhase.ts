import { resolveRewindPlan } from "../resolveRewindPlan";
import type { BacklogItem } from "../types";

export function withReviewPhase(item: BacklogItem): BacklogItem {
	if (!item.plan || item.plan.length === 0) return item;
	return { ...item, plan: resolveRewindPlan(item) };
}
