import chalk from "chalk";
import { loadConfig } from "../../../shared/loadConfig";
import {
	configureConfigKeys,
	type ConfigureConfigKeysResult,
} from "../../config/configureConfigKeys";
import { buildHighLevelQuestions } from "./buildHighLevelQuestions";
import { proposeHighLevelGlobs } from "./proposeHighLevelGlobs";
import { resolveHighLevelConfig } from "./resolveHighLevelConfig";

export async function configureHighLevelReview(): Promise<void> {
	const current = resolveHighLevelConfig(loadConfig());
	const questions = buildHighLevelQuestions(current, proposeHighLevelGlobs());
	reportConfigured(await configureConfigKeys(questions));
}

function reportConfigured(result: ConfigureConfigKeysResult): void {
	for (const write of result.written)
		console.log(
			chalk.green(`Set ${write.key} = ${JSON.stringify(write.value)}`),
		);
	for (const key of result.skipped) console.log(chalk.dim(`Left ${key} unset`));
	console.log(chalk.dim(`Written to ${result.target}`));
}
