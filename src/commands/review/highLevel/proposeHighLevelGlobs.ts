import chalk from "chalk";
import { harnessLabel } from "../../../shared/harnessLabel";
import { highLevelGlobsFeature } from "../../../shared/harnessAdapters/reviewFeatures";
import {
	OneShotUnavailableError,
	resolveOneShotHarness,
	runOneShotPrompt,
} from "../../../shared/runOneShotPrompt";
import { buildGlobProposalPrompt } from "./buildGlobProposalPrompt";
import { parseProposedGlobs } from "./parseProposedGlobs";
import type { ProposedGlobs } from "./ProposedGlobs";
import { summariseRepoTree } from "./summariseRepoTree";

const NOTHING_PROPOSED: ProposedGlobs = { criticalPaths: [], uiPaths: [] };

export async function proposeHighLevelGlobs(
	cwd: string = process.cwd(),
): Promise<ProposedGlobs> {
	const tree = summariseRepoTree(cwd);
	if (tree === "") return NOTHING_PROPOSED;
	const harness = resolveOneShotHarness();
	const label = harnessLabel(harness);
	console.log(
		chalk.dim(`Asking ${label} to propose globs from the repo's own tree...`),
	);
	try {
		const output = await runOneShotPrompt(
			buildGlobProposalPrompt(tree),
			highLevelGlobsFeature,
			{ harness, timeout: 120_000, effort: "medium", cwd },
		);
		return parseProposedGlobs(output);
	} catch (error) {
		if (error instanceof OneShotUnavailableError)
			console.log(chalk.yellow(error.message));
		console.log(
			chalk.yellow(
				`${label} proposed nothing; answer each key from its current value.`,
			),
		);
		return NOTHING_PROPOSED;
	}
}
