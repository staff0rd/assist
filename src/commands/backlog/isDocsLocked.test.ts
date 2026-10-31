import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items, links } from "../../shared/db/schema";
import { recordDocsUnlock } from "../docs/recordDocsUnlock";

const mockRefreshAfter = vi.fn<() => number | undefined>();
const mockGetDb = vi.fn<() => Promise<Db>>();

vi.mock("./docsRefreshAfter", () => ({
	docsRefreshAfter: () => mockRefreshAfter(),
}));

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => mockGetDb(),
	closeDb: () => Promise.resolve(),
}));

import { isDocsLocked } from "./isDocsLocked";

const ENV = "ASSIST_BACKLOG_ITEM_ID";
const ORIGIN = "github.com/acme/app";
let orm: Db;

async function addStory(name: string): Promise<number> {
	const [row] = await orm
		.insert(items)
		.values({
			origin: ORIGIN,
			type: "story",
			name,
			status: "todo",
			currentPhase: 1,
		})
		.returning({ id: items.id });
	return row.id;
}

beforeEach(async () => {
	({ orm } = await createTestDb());
	mockGetDb.mockResolvedValue(orm);
	mockRefreshAfter.mockReturnValue(5);
});

afterEach(() => {
	delete process.env[ENV];
	vi.clearAllMocks();
});

describe("isDocsLocked", () => {
	it("locks a backlog phase on an ordinary item", async () => {
		process.env[ENV] = String(await addStory("Add widgets"));
		expect(await isDocsLocked()).toBe(true);
	});

	it("does not lock a Refresh docs item", async () => {
		const story = await addStory("Add widgets");
		const refresh = await addStory("Refresh docs");
		await orm
			.insert(links)
			.values({ itemId: refresh, type: "docs-refresh", targetId: story });
		process.env[ENV] = String(refresh);
		expect(await isDocsLocked()).toBe(false);
	});

	it("does not lock an item phase with a docs unlock approval", async () => {
		const id = await addStory("Docs landing page");
		await recordDocsUnlock(orm, id, 1);
		process.env[ENV] = String(id);
		expect(await isDocsLocked()).toBe(false);
	});

	it("locks again once the item moves on to another phase", async () => {
		const id = await addStory("Docs landing page");
		await recordDocsUnlock(orm, id, 1);
		await orm.update(items).set({ currentPhase: 2 }).where(eq(items.id, id));
		process.env[ENV] = String(id);
		expect(await isDocsLocked()).toBe(true);
	});

	it.each(["done", "wontdo"])(
		"locks again once the unlocked item is %s",
		async (status) => {
			const id = await addStory("Docs landing page");
			await recordDocsUnlock(orm, id, 1);
			await orm.update(items).set({ status }).where(eq(items.id, id));
			process.env[ENV] = String(id);
			expect(await isDocsLocked()).toBe(true);
		},
	);

	it("does not apply another item's docs unlock", async () => {
		await recordDocsUnlock(orm, await addStory("Docs landing page"), 1);
		process.env[ENV] = String(await addStory("Add widgets"));
		expect(await isDocsLocked()).toBe(true);
	});

	it("does not lock a session with no backlog item", async () => {
		expect(await isDocsLocked()).toBe(false);
		expect(mockGetDb).not.toHaveBeenCalled();
	});

	it("does not lock a repo without docs.refreshAfter", async () => {
		mockRefreshAfter.mockReturnValue(undefined);
		process.env[ENV] = String(await addStory("Add widgets"));
		expect(await isDocsLocked()).toBe(false);
		expect(mockGetDb).not.toHaveBeenCalled();
	});

	it("does not lock when the database is unreachable", async () => {
		mockGetDb.mockRejectedValue(new Error("no db"));
		process.env[ENV] = "42";
		expect(await isDocsLocked()).toBe(false);
	});
});
