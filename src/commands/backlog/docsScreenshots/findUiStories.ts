import { isUiFile } from "./isUiFile";

type StoryCommits = { id: number; name: string; commits: string[] };

type UiStory = { id: number; name: string; files: string[] };

export function findUiStories(
	stories: StoryCommits[],
	filesForCommit: (sha: string) => string[],
): UiStory[] {
	return stories.flatMap((story) => {
		const files = [
			...new Set(story.commits.flatMap(filesForCommit).filter(isUiFile)),
		].sort();
		return files.length > 0 ? [{ id: story.id, name: story.name, files }] : [];
	});
}
