import chalk from "chalk";
import { findScreenshotProblems } from "./findScreenshotProblems";
import { loadRefreshUiStories } from "./loadRefreshUiStories";
import { parseStoryMappings } from "./parseStoryMappings";
import { printUiStories } from "./printUiStories";

function fail(message?: string): void {
	if (message) console.error(chalk.red(message));
	process.exitCode = 1;
}

export async function docsScreenshots(
	id: string,
	options: { story?: string[] } = {},
): Promise<void> {
	let mappings: Map<number, string[]>;
	try {
		mappings = parseStoryMappings(options.story ?? []);
	} catch (error) {
		fail((error as Error).message);
		return;
	}
	const uiStories = await loadRefreshUiStories(id);
	if (!Array.isArray(uiStories)) {
		fail(uiStories.error);
		return;
	}
	if (uiStories.length === 0 && mappings.size === 0) {
		console.log("No covered story changed UI files; no screenshots needed");
		return;
	}
	printUiStories(uiStories, mappings);
	const problems = findScreenshotProblems(
		uiStories.map((s) => s.id),
		mappings,
	);
	if (problems.length === 0) {
		console.log(
			chalk.green("Every UI story has a new or recaptured screenshot"),
		);
		return;
	}
	for (const problem of problems) fail(problem);
}
