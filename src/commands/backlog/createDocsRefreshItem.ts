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
			`Walk each covered story (${storyList}) one at a time: run \`assist backlog view <id>\` for that story alone and read its full output (if the output is persisted to a file, read the file, not just the preview), then run \`git show --stat <sha>\` on every one of its commits and \`git show <sha>\` on any that touch UI, commands, config or other user-visible code; note everything it changed for users across all of its phases, not just its last summary`,
			"Skip a story only after inspecting all of its commits and finding no user-facing change (UI screens, notices, counts, commands, flags, config keys, apps); record a one-line reason for each skip, and leave pages untouched for skipped stories",
			"For the rest, update the affected pages under `docs/src/content/docs/` (wording, new behaviour on existing pages, removed features) following the rules in `docs/CLAUDE.md`",
			...(coverageCheck
				? [
						"Run `assist run docs:coverage`; while it fails, list the gaps with `assist run docs:coverage --report` and add `covers` entries to the pages that document them (or new pages) until it passes",
					]
				: []),
			"Ask the user to review the docs changes with `assist ask` and wait for their approval before committing. Keep the body a concise summary with no raw diff (the user reviews the changes in the docs viewer): list each changed page (`git status --porcelain -- docs/src/content/docs/`) as a link to it in the docs preview (`http://localhost:4173/<page>/` for `docs/src/content/docs/<page>.md(x)`, and `http://localhost:4173/` for `index.md(x)`) with a few words on what changed, then the stories included, then each skipped story with its one-line reason",
		],
		serializeManualChecks([
			"Review every changed docs page in the docs preview and approve it",
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
