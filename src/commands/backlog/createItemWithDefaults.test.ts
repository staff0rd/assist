import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";
import { createItemWithDefaults } from "./createItemWithDefaults";
import { loadItem } from "./loadItem";

let orm: Db;
let close: () => Promise<void>;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

vi.mock("./shared", () => ({
	getOrigin: () => "test",
}));

beforeEach(async () => {
	({ orm, close } = await createTestDb());
});

afterEach(async () => {
	await close();
});

async function create(
	phases: { name: string; tasks: string[]; manualChecks?: string[] }[],
) {
	const id = await createItemWithDefaults({
		type: "story",
		name: "Story",
		acceptanceCriteria: ["works"],
		phases,
	});
	const item = await loadItem(orm, id);
	if (!item) throw new Error("missing item");
	return item;
}

describe("createItemWithDefaults", () => {
	it("folds the last phase's manual checks onto a stored Review phase", async () => {
		const item = await create([
			{ name: "A", tasks: ["a"], manualChecks: ["a1"] },
			{ name: "B", tasks: ["b"], manualChecks: ["b1", "b2"] },
		]);

		expect(item.plan?.map((p) => p.name)).toEqual([
			"A",
			"B",
			REVIEW_PHASE_NAME,
		]);
		expect(item.plan?.[0].manualChecks).toEqual(["a1"]);
		expect(item.plan?.[1].manualChecks).toBeUndefined();
		expect(item.plan?.[2].manualChecks).toEqual(["b1", "b2"]);
		expect(item.plan?.[2].tasks.length).toBeGreaterThan(0);
	});

	it("stores no Review phase when the last phase has no checks", async () => {
		const item = await create([
			{ name: "A", tasks: ["a"], manualChecks: ["a1"] },
			{ name: "B", tasks: ["b"] },
		]);

		expect(item.plan?.map((p) => p.name)).toEqual(["A", "B"]);
		expect(item.plan?.[0].manualChecks).toEqual(["a1"]);
	});
});
