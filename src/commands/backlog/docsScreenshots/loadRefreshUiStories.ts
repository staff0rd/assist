import { formatItemId } from "../formatItemId";
import { loadDocsRefreshStories } from "../loadDocsRefreshStories";
import { findOneItem } from "../shared";
import { findUiStories } from "./findUiStories";
import { listCommitFiles } from "./listCommitFiles";

type UiStory = ReturnType<typeof findUiStories>[number];

export async function loadRefreshUiStories(
	id: string,
): Promise<UiStory[] | { error?: string }> {
	const found = await findOneItem(id);
	if (!found) return {};
	const { orm, item } = found;
	const storyIds = (item.links ?? [])
		.filter((l) => l.type === "docs-refresh")
		.map((l) => l.targetId);
	if (storyIds.length === 0)
		return { error: `${formatItemId(item.id)} covers no docs-refresh stories` };
	const stories = await loadDocsRefreshStories(orm, storyIds);
	return findUiStories(stories, listCommitFiles);
}
