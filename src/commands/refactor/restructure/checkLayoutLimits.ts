import { type DeepChain, findDeepChains } from "./findDeepChains";
import type { RestructurePlan } from "./types";

export type LayoutLimits = {
	maxDepth: number;
	chains: DeepChain[];
};

export function checkLayoutLimits(
	plan: RestructurePlan,
	maxDepth: number,
): LayoutLimits {
	return {
		maxDepth,
		chains: findDeepChains(plan.targets.values(), plan.scopeRoot, maxDepth),
	};
}
