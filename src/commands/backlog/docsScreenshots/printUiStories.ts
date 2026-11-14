import chalk from "chalk";
import { formatItemId } from "../formatItemId";

type UiStory = { id: number; name: string; files: string[] };

export function printUiStories(
	uiStories: UiStory[],
	mappings: Map<number, string[]>,
): void {
	for (const story of uiStories) {
		const shots = mappings.get(story.id) ?? [];
		const mapped = shots.length > 0 ? ` → ${shots.join(", ")}` : "";
		console.log(chalk.bold(`${formatItemId(story.id)} ${story.name}`) + mapped);
		for (const file of story.files) console.log(`  ${file}`);
	}
}
