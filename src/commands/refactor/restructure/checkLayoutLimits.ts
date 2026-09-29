import { type DeepChain, findDeepChains } from "./findDeepChains";
import { findLargeFolders, type LargeFolder } from "./findLargeFolders";
import type { RestructurePlan } from "./types";

type LimitSettings = {
	maxDepth: number;
	maxFolderPercent: number;
	maxFolderFiles: number;
};

export type LayoutLimits = {
	maxDepth: number;
	chains: DeepChain[];
	folderLimit: number;
	largeFolders: LargeFolder[];
};

export function checkLayoutLimits(
	plan: RestructurePlan,
	settings: LimitSettings,
): LayoutLimits {
	const targets = [...plan.targets.values()];
	const folderLimit = Math.min(
		Math.ceil((targets.length * settings.maxFolderPercent) / 100),
		settings.maxFolderFiles,
	);
	return {
		maxDepth: settings.maxDepth,
		chains: findDeepChains(targets, plan.scopeRoot, settings.maxDepth),
		folderLimit,
		largeFolders: findLargeFolders(targets, plan.scopeRoot, folderLimit),
	};
}
