import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { countPendingHandovers } from "./countPendingHandovers";
import { recallHandover } from "./recallHandover";
import { saveHandover } from "./saveHandover";

const ORIGIN = "github.com/acme/repo";

describe("handover DB round-trip", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	it("recalls the most recent unrecalled note and marks it recalled", async () => {
		await saveHandover(orm, {
			origin: ORIGIN,
			summary: "older",
			content: "first",
			createdAt: new Date("2026-01-01T00:00:00Z"),
		});
		await saveHandover(orm, {
			origin: ORIGIN,
			summary: "newer",
			content: "second",
			createdAt: new Date("2026-02-01T00:00:00Z"),
		});

		expect(await countPendingHandovers(orm, ORIGIN)).toBe(2);

		const content = await recallHandover(orm, ORIGIN);
		expect(content).toBe("second");

		// recalled note drops out of the pending count
		expect(await countPendingHandovers(orm, ORIGIN)).toBe(1);

		const next = await recallHandover(orm, ORIGIN);
		expect(next).toBe("first");
		expect(await countPendingHandovers(orm, ORIGIN)).toBe(0);
	});

	it("returns undefined when no unrecalled notes exist", async () => {
		expect(await recallHandover(orm, ORIGIN)).toBeUndefined();
	});

	it("scopes notes by origin", async () => {
		await saveHandover(orm, { origin: ORIGIN, summary: "s", content: "mine" });
		await saveHandover(orm, {
			origin: "github.com/other/repo",
			summary: "s",
			content: "theirs",
		});

		expect(await countPendingHandovers(orm, ORIGIN)).toBe(1);
		expect(await recallHandover(orm, ORIGIN)).toBe("mine");
	});
});
