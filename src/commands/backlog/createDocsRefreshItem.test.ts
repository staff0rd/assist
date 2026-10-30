import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { comments, itemGitRefs, items } from "../../shared/db/schema";
import { createDocsRefreshItem } from "./createDocsRefreshItem";
import { formatItemId } from "./formatItemId";
import { loadItem } from "./loadItem";

const ORIGIN = "github.com/acme/app";
let orm: Db;

async function addStory(name: string): Promise<number> {
	const [row] = await orm
		.insert(items)
		.values({ origin: ORIGIN, type: "story", name, status: "done" })
		.returning({ id: items.id });
	return row.id;
}

async function addSummary(itemId: number, idx: number, text: string) {
	await orm.insert(comments).values({
		itemId,
		idx,
		text,
		type: "summary",
		timestamp: "2026-10-31T00:00:00.000Z",
	});
}

describe("createDocsRefreshItem", () => {
	beforeEach(async () => {
		({ orm } = await createTestDb());
	});

	it("lists each covered story with its latest summary and commits", async () => {
		const a = await addStory("Add widgets");
		const b = await addStory("Tidy logs");
		await addSummary(a, 0, "Phase 1 summary");
		await addSummary(a, 1, "Widgets shipped");
		await orm.insert(itemGitRefs).values({
			itemId: a,
			kind: "commit",
			ref: "0123456789abcdef",
		});

		const id = await createDocsRefreshItem(orm, ORIGIN, [a, b]);
		const item = await loadItem(orm, id);

		const description = item?.description ?? "";
		expect(description).toContain(`${formatItemId(a)} Add widgets`);
		expect(description).toContain("Widgets shipped");
		expect(description).not.toContain("Phase 1 summary");
		expect(description).toContain("`01234567`");
		expect(description).toContain(`${formatItemId(b)} Tidy logs`);
		expect(description).toContain("_No done summary._");
		expect(description).toContain("assist backlog view <id>");
	});

	it("plans a walk of the covered stories that skips non-user-facing ones", async () => {
		const a = await addStory("Add widgets");

		const id = await createDocsRefreshItem(orm, ORIGIN, [a]);
		const tasks = (await loadItem(orm, id))?.plan?.[0].tasks.map((t) => t.task);

		expect(tasks).toHaveLength(3);
		expect(tasks?.[0]).toContain(formatItemId(a));
		expect(tasks?.[1]).toContain("no user-facing change");
		expect(tasks?.[2]).toContain("docs/src/content/docs/");
		expect(tasks?.[2]).toContain("docs/CLAUDE.md");
	});
});
