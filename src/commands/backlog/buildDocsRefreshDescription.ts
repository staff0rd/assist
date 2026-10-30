import { formatItemId } from "./formatItemId";
import type { DocsRefreshStory } from "./loadDocsRefreshStories";

function storyEntry(story: DocsRefreshStory): string {
	const lines = [`### ${formatItemId(story.id)} ${story.name}`, ""];
	lines.push(story.summary ?? "_No done summary._");
	if (story.commits.length > 0)
		lines.push(
			"",
			`Commits: ${story.commits.map((c) => `\`${c.slice(0, 8)}\``).join(", ")}`,
		);
	return lines.join("\n");
}

export function buildDocsRefreshDescription(
	stories: DocsRefreshStory[],
): string {
	return [
		"Update the docs pages under `docs/src/content/docs/` from what these done stories shipped. Stories leave docs alone during development, so this item owns both the prose (wording, new behaviour on existing pages, removed features) and the `covers` entries that document new commands, skills, config keys and routes.",
		"For detail on a story, run `assist backlog view <id>` (description, acceptance criteria, summaries and activity) and `git show <sha>` on its commits.",
		"## Covered stories",
		...stories.map(storyEntry),
	].join("\n\n");
}
