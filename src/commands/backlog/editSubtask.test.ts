import { and, asc, eq } from "drizzle-orm";
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

import { editSubtask } from "./editSubtask";
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

async function getSubtask(orm: Db, idx: number) {
	const [row] = await orm
		.select({
			title: itemSubtasks.title,
			description: itemSubtasks.description,
			status: itemSubtasks.status,
		})
		.from(itemSubtasks)
		.where(and(eq(itemSubtasks.itemId, 1), eq(itemSubtasks.idx, idx)));
	return row;
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

describe("editSubtask", () => {
	it("updates the title, leaving other fields unchanged", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "Old title", "Keep me", "in-progress");
		mockItem([{ title: "Old title" }]);

		await editSubtask("1", "1", { title: "New title" });

		expect(await getSubtask(orm, 0)).toEqual({
			title: "New title",
			description: "Keep me",
			status: "in-progress",
		});
		expect(process.exitCode).toBeUndefined();
	});

	it(String.raw`updates the description, unescaping \n newlines`, async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "Title");
		mockItem([{ title: "Title" }]);

		await editSubtask("1", "1", { desc: String.raw`line1\nline2` });

		expect((await getSubtask(orm, 0)).description).toBe("line1\nline2");
	});

	it("clears the description when --desc is an empty string", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "Title", "Existing description");
		mockItem([{ title: "Title" }]);

		await editSubtask("1", "1", { desc: "" });

		expect((await getSubtask(orm, 0)).description).toBeNull();
	});

	it("updates the status", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "Title");
		mockItem([{ title: "Title" }]);

		await editSubtask("1", "1", { status: "done" });

		expect((await getSubtask(orm, 0)).status).toBe("done");
	});

	it("rejects an invalid status without writing", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "Title");
		mockItem([{ title: "Title" }]);

		await editSubtask("1", "1", { status: "bogus" });

		expect(process.exitCode).toBe(1);
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining('Invalid status "bogus"'),
		);
		expect((await getSubtask(orm, 0)).status).toBe("todo");
	});

	it("rejects an out-of-range index with a clear 1-based message", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "Title");
		mockItem([{ title: "Title" }]);

		await editSubtask("1", "5", { title: "New" });

		expect(process.exitCode).toBe(1);
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining("has no sub-task 5 (1-1)"),
		);
		expect((await getSubtask(orm, 0)).title).toBe("Title");
	});

	it("rejects a non-numeric index", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "Title");
		mockItem([{ title: "Title" }]);

		await editSubtask("1", "abc", { title: "New" });

		expect(process.exitCode).toBe(1);
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining("has no sub-task abc"),
		);
	});

	it("errors when no fields are provided", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "Title");
		mockItem([{ title: "Title" }]);

		await editSubtask("1", "1", {});

		expect(process.exitCode).toBe(1);
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining("Nothing to update"),
		);
	});

	it("leaves other sub-tasks untouched when editing one", async () => {
		await seedItem(orm);
		await seedSubtask(orm, 0, "First");
		await seedSubtask(orm, 1, "Second", "desc2", "done");
		mockItem([{ title: "First" }, { title: "Second" }]);

		await editSubtask("1", "1", { title: "First edited" });

		expect(await getSubtasks(orm)).toEqual([
			{ idx: 0, title: "First edited", description: null, status: "todo" },
			{ idx: 1, title: "Second", description: "desc2", status: "done" },
		]);
	});
});
