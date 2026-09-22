import chalk from "chalk";
import { loadConfig } from "../../../shared/loadConfig";
import {
	configureConfigKeys,
	type ConfigureConfigKeysResult,
} from "../../config/configureConfigKeys";
import type { ConfigKeyScope } from "../../config/writeConfigKeys";
import { buildHighLevelQuestions } from "./buildHighLevelQuestions";
import {
	answersCoverEveryKey,
	parseConfigureAnswers,
} from "./parseConfigureAnswers";
import { proposeHighLevelGlobs } from "./proposeHighLevelGlobs";
import type { ProposedGlobs } from "./ProposedGlobs";
import { resolveHighLevelConfig } from "./resolveHighLevelConfig";

type ConfigureOptions = {
	scope?: string;
	answer?: string[];
};

const NOTHING_PROPOSED: ProposedGlobs = { criticalPaths: [], uiPaths: [] };

export async function configureHighLevelReview(
	options: ConfigureOptions = {},
): Promise<void> {
	const answers = parseConfigureAnswers(options.answer ?? []);
	const proposed = answersCoverEveryKey(answers)
		? NOTHING_PROPOSED
		: proposeHighLevelGlobs();
	const questions = buildHighLevelQuestions(
		resolveHighLevelConfig(loadConfig()),
		proposed,
	);
	const scope = asConfigKeyScope(options.scope);
	reportConfigured(
		await configureConfigKeys(questions, {
			answers,
			...(scope ? { scope } : {}),
		}),
	);
}

function asConfigKeyScope(
	value: string | undefined,
): ConfigKeyScope | undefined {
	if (value === "project" || value === "repo") return value;
	return undefined;
}

function reportConfigured(result: ConfigureConfigKeysResult): void {
	for (const write of result.written)
		console.log(
			chalk.green(`Set ${write.key} = ${JSON.stringify(write.value)}`),
		);
	for (const key of result.skipped) console.log(chalk.dim(`Left ${key} unset`));
	console.log(chalk.dim(`Written to ${result.target}`));
}
