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

import { findOneItem } from "./shared";
import { removeSubtask } from "./removeSubtask";

const mockFindOneItem = findOneItem as unknown as MockInstance;

async function seedItem(orm: Db): Promise<void> {
	await orm.insert(items).values({
		id: 1,
		origin: "test",
		name: "Test",
		status: "in-progress",
	});
}

async function seedSubtask(
	orm: Db,
	idx: number,
	title: string,
	description: string | null = null,
	status = "todo",
): Promise<void> {
	await orm
		.insert(itemSubtasks)
		.values({ itemId: 1, idx, title, description, status });
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
});

afterEach(async () => {
	await close();
	logSpy.mockRestore();
	mockFindOneItem.mockReset();
	process.exitCode = undefined;
});

function mockItem(subtasks: { title: string }[]): void {
	mockFindOneItem.mockImplementation(async () => ({
		orm,
		item: { id: 1, subtasks },
	}));
}

describe("removeSubtask", () => {
	it("removes the only sub-task", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "Only");
		mockItem([{ title: "Only" }]);

		await removeSubtask("1", "1");

		expect(await getSubtasks(orm)).toEqual([]);
		expect(process.exitCode).toBeUndefined();
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining("Removed sub-task 1 of item #1: Only"),
		);
	});

	it("re-indexes later sub-tasks contiguously from 0", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "First");
		await seedSubtask(orm, 1, "Second", "desc2", "in-progress");
		await seedSubtask(orm, 2, "Third", null, "done");
		mockItem([{ title: "First" }, { title: "Second" }, { title: "Third" }]);

		await removeSubtask("1", "1");

		expect(await getSubtasks(orm)).toEqual([
			{ idx: 0, title: "Second", description: "desc2", status: "in-progress" },
			{ idx: 1, title: "Third", description: null, status: "done" },
		]);
	});

	it("leaves earlier sub-tasks untouched when removing a later one", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "First");
		await seedSubtask(orm, 1, "Second");
		await seedSubtask(orm, 2, "Third");
		mockItem([{ title: "First" }, { title: "Second" }, { title: "Third" }]);

		await removeSubtask("1", "3");

		expect(await getSubtasks(orm)).toEqual([
			{ idx: 0, title: "First", description: null, status: "todo" },
			{ idx: 1, title: "Second", description: null, status: "todo" },
		]);
	});

	it("rejects an out-of-range index with a clear 1-based message", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "First");
		mockItem([{ title: "First" }]);

		await removeSubtask("1", "5");

		expect(process.exitCode).toBe(1);
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining("has no sub-task 5 (1-1)"),
		);
		expect(await getSubtasks(orm)).toEqual([
			{ idx: 0, title: "First", description: null, status: "todo" },
		]);
	});

	it("rejects a non-numeric index", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "First");
		mockItem([{ title: "First" }]);

		await removeSubtask("1", "abc");

		expect(process.exitCode).toBe(1);
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining("has no sub-task abc"),
		);
		expect(await getSubtasks(orm)).toEqual([
			{ idx: 0, title: "First", description: null, status: "todo" },
		]);
	});
});
