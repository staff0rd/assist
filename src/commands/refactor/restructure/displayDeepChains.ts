import chalk from "chalk";
import type { DeepChain } from "./findDeepChains";

const shownChains = 10;

function formatChain(chain: DeepChain): string {
	const folders = chain.folders
		.map((f) => `${f.name} (${f.files})`)
		.join(" > ");
	return `  ${folders} > …  [${chain.tooDeep} file(s) too deep, down to depth ${chain.deepest}]`;
}

export function displayDeepChains(chains: DeepChain[], maxDepth: number): void {
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
}
