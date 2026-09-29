import chalk from "chalk";
import type { DeepChain } from "./findDeepChains";

const shownChains = 10;

const pinGuidance = [
	"To bring the plan within the limit, add modules to restructure.pin in assist.yml (basename without extension). A pinned module moves up beside the nearest root or pinned module above it, taking its subtree with it.",
	"- On each chain, pin the highest module that is a feature boundary: a route, view, page, panel, dialog or card a user would recognise as one thing.",
	"- Never pin hooks, utilities, style files or helpers just because they head a big subtree; they move up with their feature.",
	"- Add one pin at a time and re-run the dry-run: one feature pin often fixes several chains.",
	"- After each pin, check the resulting tree for a folder that has grown large with files shared between pinned features; if one has, pin the feature those files belong to or undo the last pin.",
	"- If no module on a chain is a sensible feature boundary, leave it and report the chain instead of forcing a pin.",
];

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
	console.log("");
	for (const line of pinGuidance) console.log(chalk.yellow(line));
}
