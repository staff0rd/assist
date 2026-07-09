import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import { searchItemIds } from "./searchItemIds";

let orm: Db;
let close: () => Promise<void>;

describe("searchItemIds", () => {
	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		await orm.insert(items).values([
			{
				id: 1,
				origin: "test",
				name: "One",
				status: "todo",
				jiraKey: "BAD-671",
			},
			{ id: 2, origin: "test", name: "Two", status: "todo", jiraKey: "BAD-99" },
			{ id: 3, origin: "test", name: "Three", status: "todo" },
			{ id: 42, origin: "test", name: "Forty Two", status: "todo" },
			{ id: 142, origin: "test", name: "One Forty Two", status: "todo" },
		]);
	});

	afterEach(async () => {
		await close();
	});

	it("matches a full Jira key", async () => {
		expect(await searchItemIds(orm, "BAD-671")).toEqual([1]);
	});

	it("matches a project-prefix substring", async () => {
		expect(await searchItemIds(orm, "BAD")).toEqual([1, 2]);
	});

	it("matches Jira keys case-insensitively", async () => {
		expect(await searchItemIds(orm, "bad-671")).toEqual([1]);
	});

	it("does not return items without a Jira key for an unrelated query", async () => {
		expect(await searchItemIds(orm, "BAD")).not.toContain(3);
	});

	it("matches a backlog number exactly", async () => {
		expect(await searchItemIds(orm, "142")).toEqual([142]);
	});

	it("matches a backlog number as a substring", async () => {
		expect(await searchItemIds(orm, "42")).toEqual([42, 142]);
	});

	it("ignores a leading # when matching a backlog number", async () => {
		expect(await searchItemIds(orm, "#42")).toEqual([42, 142]);
	});

	it("does not match unrelated items for a number query", async () => {
		expect(await searchItemIds(orm, "42")).not.toContain(1);
		expect(await searchItemIds(orm, "42")).not.toContain(2);
		expect(await searchItemIds(orm, "42")).not.toContain(3);
	});
});
