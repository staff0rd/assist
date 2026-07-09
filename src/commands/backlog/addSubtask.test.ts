import { asc, eq } from "drizzle-orm";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items, itemSubtasks } from "../../shared/db/schema";

vi.mock("./shared", () => ({
	findOneItem: vi.fn(),
}));

import { addSubtask } from "./addSubtask";
import { findOneItem } from "./shared";

const mockFindOneItem = findOneItem as unknown as MockInstance;

async function seedItem(orm: Db): Promise<void> {
	await orm.insert(items).values({
		id: 1,
		origin: "test",
		name: "Test",
		status: "in-progress",
	});
}

function getSubtasks(orm: Db) {
	return orm
		.select({
			idx: itemSubtasks.idx,
			title: itemSubtasks.title,
			description: itemSubtasks.description,
			status: itemSubtasks.status,
		})
		.from(itemSubtasks)
		.where(eq(itemSubtasks.itemId, 1))
		.orderBy(asc(itemSubtasks.idx));
}

let orm: Db;
let close: () => Promise<void>;
let logSpy: MockInstance;

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
	process.exitCode = undefined;
	mockFindOneItem.mockImplementation(async () => ({
		orm,
		item: { id: 1 },
	}));
});

afterEach(async () => {
	await close();
	logSpy.mockRestore();
	mockFindOneItem.mockReset();
	process.exitCode = undefined;
});

describe("addSubtask", () => {
	it("accepts a title of exactly 50 characters unchanged", async () => {
		await seedItem(orm);
		const title = "a".repeat(50);

		await addSubtask("1", { title });

		expect(process.exitCode).toBeUndefined();
		expect(await getSubtasks(orm)).toEqual([
			{ idx: 0, title, description: null, status: "todo" },
		]);
	});

	it("rejects a title longer than 50 characters and points at --desc", async () => {
		await seedItem(orm);

		await addSubtask("1", { title: "a".repeat(51) });

		expect(process.exitCode).toBe(1);
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("--desc"));
		expect(await getSubtasks(orm)).toEqual([]);
		expect(mockFindOneItem).not.toHaveBeenCalled();
	});

	it("rejects an empty title", async () => {
		await seedItem(orm);

		await addSubtask("1", { title: "   " });

		expect(process.exitCode).toBe(1);
		expect(await getSubtasks(orm)).toEqual([]);
	});
});
