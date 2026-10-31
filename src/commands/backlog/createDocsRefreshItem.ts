import type { Db } from "../../shared/db/Db";
import { links } from "../../shared/db/schema";
import { buildDocsRefreshDescription } from "./buildDocsRefreshDescription";
import { formatItemId } from "./formatItemId";
import { hasDocsCoverageRun } from "./hasDocsCoverageRun";
import { insertItem } from "./insertItem";
import { insertPhaseAt } from "./insertPhaseAt";
import { loadDocsRefreshStories } from "./loadDocsRefreshStories";
import { serializeManualChecks } from "./serializeManualChecks";

export async function createDocsRefreshItem(
	orm: Db,
	origin: string,
	storyIds: number[],
	coverageCheck = hasDocsCoverageRun(),
): Promise<number> {
	const stories = await loadDocsRefreshStories(orm, storyIds);
	const storyList = storyIds.map(formatItemId).join(", ");
	const id = await insertItem(
		orm,
		{
			type: "story",
			name: "Refresh docs",
			description: buildDocsRefreshDescription(stories),
			acceptanceCriteria: [
				"Docs pages reflect the behaviour shipped by every covered story",
				"Pages are left untouched for stories with no user-facing change",
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
			`Walk each covered story (${storyList}): read it with \`assist backlog view <id>\` and its commits with \`git show <sha>\`, and note what it changed for users`,
			"Skip stories with no user-facing change and leave their pages untouched",
			"For the rest, update the affected pages under `docs/src/content/docs/` (wording, new behaviour on existing pages, removed features) following the rules in `docs/CLAUDE.md`",
			...(coverageCheck
				? [
						"Run `assist run docs:coverage`; while it fails, list the gaps with `assist run docs:coverage --report` and add `covers` entries to the pages that document them (or new pages) until it passes",
					]
				: []),
			"Show the docs diff to the user with `assist ask` and wait for their approval before committing",
		],
		serializeManualChecks([
			"Review every docs page change in the diff and approve it",
		]),
		undefined,
	);
	await orm.insert(links).values(
		storyIds.map((targetId) => ({
			itemId: id,
			type: "docs-refresh",
			targetId,
		})),
	);
	return id;
}
