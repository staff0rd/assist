import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { addFeed } from "./addFeed";
import { listFeeds } from "./listFeeds";

let orm: Db;
let close: () => Promise<void>;

describe("feeds data access", () => {
	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	it("lists feeds in insertion order", async () => {
		await addFeed(orm, "https://a.example/feed");
		await addFeed(orm, "https://b.example/feed");
		expect(await listFeeds(orm)).toEqual([
			"https://a.example/feed",
			"https://b.example/feed",
		]);
	});

	it("returns an empty list when no feeds exist", async () => {
		expect(await listFeeds(orm)).toEqual([]);
	});

	it("inserts a new feed and reports it was added", async () => {
		expect(await addFeed(orm, "https://a.example/feed")).toBe(true);
	});

	it("is a no-op for a duplicate URL", async () => {
		await addFeed(orm, "https://a.example/feed");
		expect(await addFeed(orm, "https://a.example/feed")).toBe(false);
		expect(await listFeeds(orm)).toEqual(["https://a.example/feed"]);
	});
});
