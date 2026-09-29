import chalk from "chalk";
import type { LayoutLimits } from "./checkLayoutLimits";
import { displayDeepChains } from "./displayDeepChains";
import type { LargeFolder } from "./findLargeFolders";

function pinSteps(apply: string): string[] {
	return [
		"Adjust restructure.pin until this check passes:",
		"1. For a deep chain, pick the highest module on it that is a feature boundary: a route, view, page, panel, dialog or card. Never a hook, utility, style file or helper.",
		"2. Add it to restructure.pin in assist.yml yourself (basename without extension). One pin at a time: one feature pin often fixes several chains.",
		"3. For a folder over the file limit, a pin has lifted features beside each other and pushed the files they share into it. Remove the pin you added most recently, or replace it with a different boundary on the same chain.",
		"4. Re-run this command. Repeat until there are no deep chains and no folders over the limit.",
		"5. If a chain has no sensible feature boundary, or every pin that fixes the depth pushes a folder over the limit, stop and report it.",
		`Then run \`${apply}\`.`,
	];
}

function displayLargeFolders(folders: LargeFolder[], limit: number): void {
	if (folders.length === 0) return;
	console.log(
		chalk.red(
			`\nPlan puts more than ${limit} file(s) in ${folders.length} folder(s) (restructure.maxFolderPercent of all files, capped at restructure.maxFolderFiles):`,
		),
	);
	for (const { folder, files } of folders)
		console.log(`  ${folder}/ ${files} file(s)`);
}

export function exceedsLayoutLimits(limits: LayoutLimits): boolean {
	return limits.chains.length > 0 || limits.largeFolders.length > 0;
}

export function displayLayoutLimits(limits: LayoutLimits, apply: string): void {
	if (!exceedsLayoutLimits(limits)) return;
	displayDeepChains(limits.chains, limits.maxDepth);
	displayLargeFolders(limits.largeFolders, limits.folderLimit);
	console.log("");
	for (const line of pinSteps(apply)) console.log(chalk.yellow(line));
}
