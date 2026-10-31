import { formatItemId } from "./formatItemId";
import type {
	DocsRefreshStory,
	DocsRefreshSummary,
} from "./loadDocsRefreshStories";

function summaryEntry(summary: DocsRefreshSummary): string {
	return summary.phase === null
		? summary.text
		: `**Phase ${summary.phase}:** ${summary.text}`;
}

function storyEntry(story: DocsRefreshStory): string {
	const lines = [`### ${formatItemId(story.id)} ${story.name}`, ""];
	if (story.summaries.length === 0) lines.push("_No done summary._");
	else lines.push(story.summaries.map(summaryEntry).join("\n\n"));
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
		"Each story below lists the summary of every phase it completed. A story's later phases are often internal (tests, refactors, pipelines) while earlier phases shipped user-facing UI or commands, so judge a story on all of its phases and commits, never on its last summary alone. Summaries are lossy: run `assist backlog view <id>` (description, acceptance criteria, summaries and activity) and `git show --stat <sha>` then `git show <sha>` on its commits for the full picture.",
		"## Covered stories",
		...stories.map(storyEntry),
	].join("\n\n");
}
