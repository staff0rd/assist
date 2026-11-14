import chalk from "chalk";
import { formatItemId } from "../formatItemId";
import { loadDocsRefreshStories } from "../loadDocsRefreshStories";
import { findOneItem } from "../shared";
import { findUiStories } from "./findUiStories";
import { listCommitFiles } from "./listCommitFiles";

export async function docsScreenshots(id: string): Promise<void> {
	const found = await findOneItem(id);
	if (!found) {
		process.exitCode = 1;
		return;
	}
	const { orm, item } = found;
	const storyIds = (item.links ?? [])
		.filter((l) => l.type === "docs-refresh")
		.map((l) => l.targetId);
	if (storyIds.length === 0) {
		console.error(
			chalk.red(`${formatItemId(item.id)} covers no docs-refresh stories`),
		);
		process.exitCode = 1;
		return;
	}
	const stories = await loadDocsRefreshStories(orm, storyIds);
	const uiStories = findUiStories(stories, listCommitFiles);
	if (uiStories.length === 0) {
		console.log("No covered story changed UI files; no screenshots needed");
		return;
	}
	for (const story of uiStories) {
		console.log(chalk.bold(`${formatItemId(story.id)} ${story.name}`));
		for (const file of story.files) console.log(`  ${file}`);
	}
}
