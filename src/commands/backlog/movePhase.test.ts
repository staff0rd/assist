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
import { items, planPhases, planTasks } from "../../shared/db/schema";

vi.mock("./shared", () => ({
	findOneItem: vi.fn(),
}));

import { movePhase } from "./movePhase";
import { findOneItem } from "./shared";

const mockFindOneItem = findOneItem as unknown as MockInstance;

async function seedItem(orm: Db, currentPhase?: number): Promise<void> {
	await orm.insert(items).values({
		id: 1,
		origin: "test",
		name: "Test",
		status: "in-progress",
		currentPhase: currentPhase ?? null,
	});
}

async function seedPhase(
	orm: Db,
	idx: number,
	name: string,
	tasks: string[],
	manualChecks?: string[],
): Promise<void> {
	await orm.insert(planPhases).values({
		itemId: 1,
		idx,
		name,
		manualChecks: manualChecks ? JSON.stringify(manualChecks) : null,
	});
	if (tasks.length) {
		await orm
			.insert(planTasks)
			.values(
				tasks.map((task, i) => ({ itemId: 1, phaseIdx: idx, idx: i, task })),
			);
	}
}

function getPhases(orm: Db) {
	return orm
		.select({
			idx: planPhases.idx,
			name: planPhases.name,
			manualChecks: planPhases.manualChecks,
		})
		.from(planPhases)
		.where(eq(planPhases.itemId, 1))
		.orderBy(asc(planPhases.idx));
}

function getTasks(orm: Db) {
	return orm
		.select({
			phase_idx: planTasks.phaseIdx,
			idx: planTasks.idx,
			task: planTasks.task,
		})
		.from(planTasks)
		.where(eq(planTasks.itemId, 1))
		.orderBy(asc(planTasks.phaseIdx), asc(planTasks.idx));
}

async function getCurrentPhase(orm: Db): Promise<number | null> {
	const [row] = await orm
		.select({ currentPhase: items.currentPhase })
		.from(items)
		.where(eq(items.id, 1));
	return row?.currentPhase ?? null;
}

let orm: Db;
let close: () => Promise<void>;
let logSpy: MockInstance;

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	mockFindOneItem.mockImplementation(async () => ({
		orm,
		item: { id: 1 },
	}));
	logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
	process.exitCode = undefined;
});

afterEach(async () => {
	await close();
	logSpy.mockRestore();
	mockFindOneItem.mockReset();
	process.exitCode = undefined;
});

describe("movePhase", () => {
	it("moves a phase forward, carrying its tasks and manual checks", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "A", ["a1"], ["checkA"]);
		await seedPhase(orm, 1, "B", ["b1", "b2"], ["checkB"]);
		await seedPhase(orm, 2, "C", ["c1"], ["checkC"]);

		await movePhase("1", "1", "3");

		expect(await getPhases(orm)).toEqual([
			{ idx: 0, name: "B", manualChecks: JSON.stringify(["checkB"]) },
			{ idx: 1, name: "C", manualChecks: JSON.stringify(["checkC"]) },
			{ idx: 2, name: "A", manualChecks: JSON.stringify(["checkA"]) },
		]);
		expect(await getTasks(orm)).toEqual([
			{ phase_idx: 0, idx: 0, task: "b1" },
			{ phase_idx: 0, idx: 1, task: "b2" },
			{ phase_idx: 1, idx: 0, task: "c1" },
			{ phase_idx: 2, idx: 0, task: "a1" },
		]);
		expect(process.exitCode).toBeUndefined();
	});

	it("moves a phase backward, keeping indices contiguous from 0", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "A", ["a1"]);
		await seedPhase(orm, 1, "B", ["b1"]);
		await seedPhase(orm, 2, "C", ["c1"]);

		await movePhase("1", "3", "1");

		expect(await getPhases(orm)).toEqual([
			{ idx: 0, name: "C", manualChecks: null },
			{ idx: 1, name: "A", manualChecks: null },
			{ idx: 2, name: "B", manualChecks: null },
		]);
		expect(await getTasks(orm)).toEqual([
			{ phase_idx: 0, idx: 0, task: "c1" },
			{ phase_idx: 1, idx: 0, task: "a1" },
			{ phase_idx: 2, idx: 0, task: "b1" },
		]);
	});

	it("treats from == to as a no-op without corrupting order", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "A", ["a1"]);
		await seedPhase(orm, 1, "B", ["b1"]);
		await seedPhase(orm, 2, "C", ["c1"]);

		await movePhase("1", "2", "2");

		expect(await getPhases(orm)).toEqual([
			{ idx: 0, name: "A", manualChecks: null },
			{ idx: 1, name: "B", manualChecks: null },
			{ idx: 2, name: "C", manualChecks: null },
		]);
		expect(process.exitCode).toBeUndefined();
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining("Moved phase 2 to position 2."),
		);
	});

	it("leaves current_phase unchanged after a move", async () => {
		await seedItem(orm, 2);
		await seedPhase(orm, 0, "A", ["a1"]);
		await seedPhase(orm, 1, "B", ["b1"]);
		await seedPhase(orm, 2, "C", ["c1"]);

		await movePhase("1", "1", "3");

		expect(await getCurrentPhase(orm)).toBe(2);
	});

	it("rejects an out-of-range position with a clear message and non-zero exit", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "A", ["a1"]);
		await seedPhase(orm, 1, "B", ["b1"]);

		await movePhase("1", "1", "5");

		expect(process.exitCode).toBe(1);
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining("out of range"),
		);
		expect(await getPhases(orm)).toEqual([
			{ idx: 0, name: "A", manualChecks: null },
			{ idx: 1, name: "B", manualChecks: null },
		]);
	});

	it("rejects a non-numeric position with a clear message and non-zero exit", async () => {
		await seedItem(orm);
		await seedPhase(orm, 0, "A", ["a1"]);
		await seedPhase(orm, 1, "B", ["b1"]);

		await movePhase("1", "abc", "1");

		expect(process.exitCode).toBe(1);
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining("out of range"),
		);
	});
});
