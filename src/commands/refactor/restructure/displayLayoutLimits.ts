import chalk from "chalk";
import type { LayoutLimits } from "./checkLayoutLimits";
import { displayDeepChains } from "./displayDeepChains";

function pinSteps(apply: string): string[] {
	return [
		"Pin feature modules until this check passes:",
		"1. On each chain, pick the highest module that is a feature boundary: a route, view, page, panel, dialog or card. Never a hook, utility, style file or helper.",
		"2. Add it to restructure.pin in assist.yml yourself (basename without extension). One pin at a time: one feature pin often fixes several chains.",
		"3. Re-run this command. Repeat until the plan is within the limit.",
		"4. If a chain has no sensible feature boundary, stop and report that chain.",
		`Then run \`${apply}\`.`,
	];
}

export function exceedsLayoutLimits(limits: LayoutLimits): boolean {
	return limits.chains.length > 0;
}

export function displayLayoutLimits(limits: LayoutLimits, apply: string): void {
	if (!exceedsLayoutLimits(limits)) return;
	displayDeepChains(limits.chains, limits.maxDepth);
	console.log("");
	for (const line of pinSteps(apply)) console.log(chalk.yellow(line));
}
