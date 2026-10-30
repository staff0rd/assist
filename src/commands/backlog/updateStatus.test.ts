import { and, eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items, links } from "../../shared/db/schema";

vi.mock("./docsRefreshAfter", () => ({ docsRefreshAfter: vi.fn() }));

import { docsRefreshAfter } from "./docsRefreshAfter";
import { updateStatus } from "./updateStatus";

const ORIGIN = "github.com/acme/app";
let orm: Db;

async function addItem(
	type: "story" | "bug" = "story",
	status = "todo",
	origin = ORIGIN,
): Promise<number> {
	const [row] = await orm
		.insert(items)
		.values({ origin, type, name: "Item", status })
		.returning({ id: items.id });
	return row.id;
}

async function markDone(...ids: number[]): Promise<void> {
	for (const id of ids) await updateStatus(orm, id, "done");
}

function refreshItems() {
	return orm
		.select()
		.from(items)
		.where(and(eq(items.origin, ORIGIN), eq(items.name, "Refresh docs")));
}

async function sweptBy(refreshId: number): Promise<number[]> {
	const rows = await orm
		.select({ targetId: links.targetId })
		.from(links)
		.where(and(eq(links.itemId, refreshId), eq(links.type, "docs-refresh")));
	return rows.map((r) => r.targetId).sort((a, b) => a - b);
}

describe("updateStatus docs refresh", () => {
	beforeEach(async () => {
		({ orm } = await createTestDb());
		vi.mocked(docsRefreshAfter).mockReturnValue(2);
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	it("never queues a refresh when docs.refreshAfter is unset", async () => {
		vi.mocked(docsRefreshAfter).mockReturnValue(undefined);
		await markDone(await addItem(), await addItem(), await addItem());

		expect(await refreshItems()).toHaveLength(0);
	});

	it("queues one refresh linking every unswept done story at the threshold", async () => {
		const a = await addItem();
		const b = await addItem();
		await markDone(a);
		expect(await refreshItems()).toHaveLength(0);

		await markDone(b);
		const [refresh] = await refreshItems();
		expect(refresh.status).toBe("todo");
		expect(await sweptBy(refresh.id)).toEqual([a, b]);
	});

	it("ignores bugs and other repos", async () => {
		const bug = await addItem("bug");
		const other = await addItem("story", "todo", "github.com/acme/other");
		const story = await addItem();
		await markDone(bug, other, story);

		expect(await refreshItems()).toHaveLength(0);
	});

	it("does not queue a second refresh while one is open", async () => {
		await markDone(await addItem(), await addItem());
		await markDone(await addItem(), await addItem());

		expect(await refreshItems()).toHaveLength(1);
	});

	it("starts the next batch from unswept stories once the refresh closes", async () => {
		await markDone(await addItem(), await addItem());
		const [first] = await refreshItems();
		const c = await addItem();
		await markDone(c);
		await updateStatus(orm, first.id, "wontdo");

		const d = await addItem();
		await markDone(d);
		const second = (await refreshItems()).find((r) => r.id !== first.id);
		expect(second).toBeDefined();
		expect(await sweptBy(second?.id ?? 0)).toEqual([c, d]);
	});

	it("does not count a done refresh item toward the threshold", async () => {
		await markDone(await addItem(), await addItem());
		const [first] = await refreshItems();
		await markDone(first.id);
		await markDone(await addItem());

		expect(await refreshItems()).toHaveLength(1);
	});
});
