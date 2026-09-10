import { readFileSync } from "node:fs";
import { loadConfig } from "../../shared/loadConfig";
import { countReadingWords } from "./countReadingWords";
import { formatReadDuration } from "./formatReadDuration";
import { parseReadBudget } from "./parseReadBudget";
import { readBodyArgument } from "./readBodyArgument";
import {
	type ReadTimeTarget,
	resolveReadTimeTarget,
} from "./resolveReadTimeTarget";
import { fetchPrBody } from "./fetchPrBody";

const DEFAULT_WORDS_PER_MINUTE = 80;

const DEFAULT_BUDGET_SECONDS = 60;

const CODE_WORDS_PER_PROSE_WORD = 2;

export async function readTime(
	target: string,
	options: { budget?: string } = {},
): Promise<void> {
	const budgetSeconds = resolveBudget(options.budget);
	const body = await loadBody(resolveReadTimeTarget(target));
	const { prose, code } = countReadingWords(body);
	const words = prose + code;
	const wordsPerMinute =
		loadConfig().prs?.readingWordsPerMinute ?? DEFAULT_WORDS_PER_MINUTE;
	const seconds = Math.round(
		((prose + code * CODE_WORDS_PER_PROSE_WORD) / wordsPerMinute) * 60,
	);
	const label = words === 1 ? "word" : "words";
	const verdict =
		seconds > budgetSeconds
			? ` · over the ~${formatReadDuration(budgetSeconds)} budget`
			: "";

	console.log(
		`${words} ${label} · ~${formatReadDuration(seconds)} read${verdict}`,
	);
}

function resolveBudget(budget: string | undefined): number {
	if (budget === undefined) return DEFAULT_BUDGET_SECONDS;
	try {
		return parseReadBudget(budget);
	} catch (error) {
		console.error(`Error: ${(error as Error).message}`);
		process.exit(1);
	}
}

async function loadBody(target: ReadTimeTarget): Promise<string> {
	if (target.kind === "stdin") return readBodyArgument("-");
	if (target.kind === "file") return readDraftFile(target.path);
	return fetchPrBody(target.number, target.repo);
}

function readDraftFile(path: string): string {
	try {
		return readFileSync(path, "utf8");
	} catch {
		console.error(`Error: Could not read \`${path}\`.`);
		console.error(
			"Pass a pull request number, a GitHub pull request URL, - for stdin, or a path to a file.",
		);
		process.exit(1);
	}
}
