import { execFileSync } from "node:child_process";
import chalk from "chalk";
import { buildGlobProposalPrompt } from "./buildGlobProposalPrompt";
import { parseProposedGlobs } from "./parseProposedGlobs";
import type { ProposedGlobs } from "./ProposedGlobs";
import { summariseRepoTree } from "./summariseRepoTree";

const NOTHING_PROPOSED: ProposedGlobs = { criticalPaths: [], uiPaths: [] };

export function proposeHighLevelGlobs(
	cwd: string = process.cwd(),
): ProposedGlobs {
	const tree = summariseRepoTree(cwd);
	if (tree === "") return NOTHING_PROPOSED;
	console.log(
		chalk.dim("Asking Claude to propose globs from the repo's own tree..."),
	);
	const output = askClaude(buildGlobProposalPrompt(tree), cwd);
	if (output === undefined) {
		console.log(
			chalk.yellow(
				"Claude proposed nothing; answer each key from its current value.",
			),
		);
		return NOTHING_PROPOSED;
	}
	return parseProposedGlobs(output);
}

function askClaude(prompt: string, cwd: string): string | undefined {
	try {
		return execFileSync("claude", ["-p", "--model", "sonnet", prompt], {
			cwd,
			encoding: "utf8",
			timeout: 120_000,
			stdio: ["ignore", "pipe", "ignore"],
		});
	} catch {
		return undefined;
	}
}
