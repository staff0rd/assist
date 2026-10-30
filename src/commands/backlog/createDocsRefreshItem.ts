import type { Db } from "../../shared/db/Db";
import { links } from "../../shared/db/schema";
import { formatItemId } from "./formatItemId";
import { insertItem } from "./insertItem";
import { insertPhaseAt } from "./insertPhaseAt";

export async function createDocsRefreshItem(
	orm: Db,
	origin: string,
	storyIds: number[],
): Promise<number> {
	const storyList = storyIds.map(formatItemId).join(", ");
	const id = await insertItem(
		orm,
		{
			type: "story",
			name: "Refresh docs",
			description: `Update the docs pages from what these done stories shipped: ${storyList}.`,
			acceptanceCriteria: [
				"Docs pages reflect the behaviour shipped by every linked story",
			],
			status: "todo",
			starred: false,
		},
		origin,
	);
	await insertPhaseAt(
		orm,
		id,
		0,
		"Refresh docs",
		[
			`Read each linked story (${storyList}) with \`assist backlog view <id>\`: its description, acceptance criteria, summaries and commits`,
			"Update the affected docs pages (wording, new behaviour on existing pages, removed features) following docs/CLAUDE.md",
		],
		null,
		undefined,
	);
	await orm
		.insert(links)
		.values(
			storyIds.map((targetId) => ({
				itemId: id,
				type: "docs-refresh",
				targetId,
			})),
		);
	return id;
}
