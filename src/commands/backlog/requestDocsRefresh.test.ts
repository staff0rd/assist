import { and, eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items, links } from "../../shared/db/schema";

vi.mock("./hasDocsCoverageRun", () => ({ hasDocsCoverageRun: () => false }));

import { requestDocsRefresh } from "./requestDocsRefresh";

const ORIGIN = "github.com/acme/app";
let orm: Db;

async function addStory(status: "done" | "todo" = "done"): Promise<number> {
	const [row] = await orm
		.insert(items)
		.values({ origin: ORIGIN, type: "story", name: "Story", status })
		.returning({ id: items.id });
	return row.id;
}

async function coveredIds(refreshId: number): Promise<number[]> {
	const rows = await orm
		.select({ targetId: links.targetId })
		.from(links)
		.where(and(eq(links.itemId, refreshId), eq(links.type, "docs-refresh")));
	return rows.map((r) => r.targetId).sort((a, b) => a - b);
}

describe("requestDocsRefresh", () => {
	beforeEach(async () => {
		({ orm } = await createTestDb());
	});

	it("creates an item covering every unswept done story", async () => {
		const a = await addStory();
		const b = await addStory();
		await addStory("todo");

		const result = await requestDocsRefresh(orm, ORIGIN);

		expect(result.outcome).toBe("created");
		if (result.outcome !== "created") return;
		expect(await coveredIds(result.id)).toEqual([a, b]);
	});

	it("returns the open item instead of creating a second", async () => {
		await addStory();
		const first = await requestDocsRefresh(orm, ORIGIN);
		await addStory();

		const second = await requestDocsRefresh(orm, ORIGIN);

		expect(first.outcome).toBe("created");
		if (first.outcome !== "created") return;
		expect(second).toEqual({ outcome: "open", id: first.id });
	});

	it("creates nothing when no done stories are unswept", async () => {
		await addStory("todo");

		expect(await requestDocsRefresh(orm, ORIGIN)).toEqual({
			outcome: "nothing-unswept",
		});
		const created = await orm
			.select()
			.from(items)
			.where(eq(items.name, "Refresh docs"));
		expect(created).toHaveLength(0);
	});

	it("skips stories swept by a finished Refresh docs item", async () => {
		await addStory();
		const first = await requestDocsRefresh(orm, ORIGIN);
		if (first.outcome !== "created") throw new Error("expected created");
		await orm
			.update(items)
			.set({ status: "done" })
			.where(eq(items.id, first.id));

		expect(await requestDocsRefresh(orm, ORIGIN)).toEqual({
			outcome: "nothing-unswept",
		});
	});
});
