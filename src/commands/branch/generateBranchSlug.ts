import chalk from "chalk";
import { branchSlugFeature } from "../../shared/harnessAdapters/harnessFeatures";
import {
	OneShotUnavailableError,
	runOneShotPrompt,
} from "../../shared/runOneShotPrompt";
import { withSpinner } from "../../shared/withSpinner";
import { deriveBranchSlug } from "./deriveBranchSlug";

export async function generateBranchSlug(description: string): Promise<string> {
	const fallback = deriveBranchSlug(description);
	const suggestion = await requestSlug(description);
	if (!suggestion) return fallback;
	const slug = deriveBranchSlug(suggestion);
	return slug === "story" ? fallback : slug;
}

async function requestSlug(description: string): Promise<string | undefined> {
	try {
		const stdout = await withSpinner("Generating a concise branch name", () =>
			runOneShotPrompt(buildPrompt(description), branchSlugFeature),
		);
		const slug = stdout
			.trim()
			.split("\n")[0]
			.replace(/^["'`]|["'`]$/g, "")
			.trim();
		return slug || undefined;
	} catch (error) {
		if (error instanceof OneShotUnavailableError)
			console.error(chalk.dim(`${error.message}\nUsing the derived name.`));
		return undefined;
	}
}

function buildPrompt(description: string): string {
	return [
		"Suggest a concise git branch name for the work described below.",
		"Rules:",
		"- kebab-case: lowercase letters, digits, and single hyphens only",
		"- 2 to 4 words that capture the essence of the work",
		"- no ticket/issue numbers and no standalone numbers",
		"- reply with ONLY the branch name, no quotes or explanation",
		"",
		`Work: ${description}`,
	].join("\n");
}
