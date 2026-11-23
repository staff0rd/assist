import type { PGlite } from "@electric-sql/pglite";
import { asc } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../createTestDb";
import type { Db } from "../Db";
import { items } from "../schema";
import { migration0016ItemPriority } from "./migration0016ItemPriority";

describe("migration0016ItemPriority", () => {
	let orm: Db;
	let close: () => Promise<void>;
	let client: PGlite;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		client = (orm as unknown as { $client: PGlite }).$client;
		await client.exec(`
			ALTER TABLE items DROP COLUMN priority;
			INSERT INTO items (id, origin, name) VALUES
				(5, 'repo-a', 'A5'), (2, 'repo-b', 'B2'), (3, 'repo-a', 'A3'),
				(9, 'repo-b', 'B9'), (7, 'repo-a', 'A7');
		`);
	});

	afterEach(async () => {
		await close();
	});

	const priorities = async () =>
		(
			await orm
				.select({ id: items.id, priority: items.priority })
				.from(items)
				.orderBy(asc(items.id))
		).map((r) => [r.id, r.priority]);

	it("backfills priorities per origin in id order", async () => {
		await client.exec(migration0016ItemPriority.sql);

		expect(await priorities()).toEqual([
			[2, 1],
			[3, 1],
			[5, 2],
			[7, 3],
			[9, 2],
		]);
	});

	it("defaults a new item's priority past every existing one", async () => {
		await client.exec(migration0016ItemPriority.sql);

		const [row] = await orm
			.insert(items)
			.values({ origin: "repo-a", name: "New" })
			.returning({ priority: items.priority });

		expect(row?.priority).toBeGreaterThan(3);
	});

	it("re-runs as a no-op", async () => {
		await client.exec(migration0016ItemPriority.sql);
		const once = await priorities();
		await client.exec(migration0016ItemPriority.sql);

		expect(await priorities()).toEqual(once);
	});
});
