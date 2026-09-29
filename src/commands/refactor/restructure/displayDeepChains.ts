import chalk from "chalk";
import type { DeepChain } from "./findDeepChains";

const shownChains = 10;

function pinSteps(apply: string): string[] {
	return [
		"Pin feature modules until this check passes:",
		"1. On each chain, pick the highest module that is a feature boundary: a route, view, page, panel, dialog or card. Never a hook, utility, style file or helper.",
		"2. Add it to restructure.pin in assist.yml yourself (basename without extension). One pin at a time: one feature pin often fixes several chains.",
		"3. Re-run this command. Repeat until the plan is within the limit.",
		"4. If a chain has no sensible feature boundary, or a pin leaves one folder holding far more files than the rest, stop and report it.",
		`Then run \`${apply}\`.`,
	];
}

function formatChain(chain: DeepChain): string {
	const folders = chain.folders
		.map((f) => `${f.name} (${f.files})`)
		.join(" > ");
	return `  ${folders} > …  [${chain.tooDeep} file(s) too deep, down to depth ${chain.deepest}]`;
}

export function displayDeepChains(
	chains: DeepChain[],
	maxDepth: number,
	apply: string,
): void {
	if (chains.length === 0) return;
	const tooDeep = chains.reduce((sum, c) => sum + c.tooDeep, 0);
	console.log(
		chalk.red(
			`\nPlan exceeds restructure.maxDepth ${maxDepth}: ${tooDeep} file(s) deeper.`,
		),
	);
	console.log(
		chalk.bold(
			"Deep chains, as folder (files beneath), most files too deep first:",
		),
	);
	for (const chain of chains.slice(0, shownChains))
		console.log(formatChain(chain));
	if (chains.length > shownChains)
		console.log(chalk.dim(`  …and ${chains.length - shownChains} more`));
	console.log("");
	for (const line of pinSteps(apply)) console.log(chalk.yellow(line));
}
