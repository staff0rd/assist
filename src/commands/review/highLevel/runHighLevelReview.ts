import chalk from "chalk";
import { loadConfig } from "../../../shared/loadConfig";
import { fetchPrBody } from "../../prs/fetchPrBody";
import { getCurrentPrNumber, getRepoInfo } from "../../prs/shared";
import { fetchPrChangedFiles } from "../fetchPrDiffInfo";
import { evaluateHighLevelChecks } from "./evaluateHighLevelChecks";
import { formatHighLevelChecklist } from "./formatHighLevelChecklist";
import { resolveHighLevelConfig } from "./resolveHighLevelConfig";

function resolvePrNumber(number: string | undefined): number {
	if (number === undefined) return getCurrentPrNumber();
	const parsed = Number(number);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		console.error(`Error: \`${number}\` is not a pull request number.`);
		process.exit(1);
	}
	return parsed;
}

export function runHighLevelReview(number: string | undefined): void {
	const prNumber = resolvePrNumber(number);
	const { org, repo } = getRepoInfo();
	const config = resolveHighLevelConfig(loadConfig());
	const body = fetchPrBody(prNumber, { org, repo });
	const changedFiles = fetchPrChangedFiles(prNumber);
	const checks = evaluateHighLevelChecks({ body, changedFiles, config });
	console.log(
		chalk.bold(`High-level review of ${org}/${repo}#${prNumber}`),
		chalk.dim(`· ${changedFiles.length} changed files`),
	);
	console.log(formatHighLevelChecklist(checks));
	console.log(
		chalk.dim(
			"\nManual items are for the reviewer to judge; see docs/high-level-review.md.",
		),
	);
}
