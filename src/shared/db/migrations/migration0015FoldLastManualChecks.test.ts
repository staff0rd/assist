import type { PGlite } from "@electric-sql/pglite";
import { asc, eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../createTestDb";
import type { Db } from "../Db";
import { items, planPhases, planTasks } from "../schema";
import { migration0015FoldLastManualChecks } from "./migration0015FoldLastManualChecks";

type Seed = { name: string; checks?: string[] };

describe("migration0015FoldLastManualChecks", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	const migrate = () =>
		(orm as unknown as { $client: PGlite }).$client.exec(
			migration0015FoldLastManualChecks.sql,
		);

	const seedItem = async (id: number, status: string, phases: Seed[]) => {
		await orm
			.insert(items)
			.values({ id, origin: "test", name: "Item", status });
		await orm.insert(planPhases).values(
			phases.map((p, idx) => ({
				itemId: id,
				idx,
				name: p.name,
				manualChecks: p.checks ? JSON.stringify(p.checks) : null,
			})),
		);
	};

	const phasesOf = async (itemId: number) =>
		(
			await orm
				.select({
					name: planPhases.name,
					manualChecks: planPhases.manualChecks,
				})
				.from(planPhases)
				.where(eq(planPhases.itemId, itemId))
				.orderBy(asc(planPhases.idx))
		).map((p) => ({
			name: p.name,
			checks: p.manualChecks ? JSON.parse(p.manualChecks) : null,
		}));

	it("adds a Review phase holding the last phase's checks for todo items", async () => {
		await seedItem(1, "todo", [
			{ name: "One", checks: ["early"] },
			{ name: "Two", checks: ["a", "b"] },
		]);
		await migrate();

		expect(await phasesOf(1)).toEqual([
			{ name: "One", checks: ["early"] },
			{ name: "Two", checks: null },
			{ name: "Review", checks: ["a", "b"] },
		]);
		const tasks = await orm
			.select({ phaseIdx: planTasks.phaseIdx, task: planTasks.task })
			.from(planTasks)
			.where(eq(planTasks.itemId, 1));
		expect(tasks).toEqual([
			{ phaseIdx: 2, task: expect.stringContaining("manual checks") },
		]);
	});

	it("appends after a stored Review phase's existing checks", async () => {
		await seedItem(1, "todo", [
			{ name: "One", checks: ["early"] },
			{ name: "Two", checks: ["a", "b"] },
			{ name: "Review", checks: ["bumped"] },
		]);
		await migrate();

		expect(await phasesOf(1)).toEqual([
			{ name: "One", checks: ["early"] },
			{ name: "Two", checks: null },
			{ name: "Review", checks: ["bumped", "a", "b"] },
		]);
	});

	it("leaves in-progress and done items and check-free plans unchanged, and re-runs as a no-op", async () => {
		const plan = [
			{ name: "One", checks: ["early"] },
			{ name: "Two", checks: ["a"] },
		];
		await seedItem(1, "in-progress", plan);
		await seedItem(2, "done", plan);
		await seedItem(3, "todo", [
			{ name: "One" },
			{ name: "Review", checks: ["x"] },
		]);
		await seedItem(4, "todo", plan);
		await migrate();
		const once = await phasesOf(4);
		await migrate();

		const unchanged = plan.map((p) => ({ name: p.name, checks: p.checks }));
		expect(await phasesOf(1)).toEqual(unchanged);
		expect(await phasesOf(2)).toEqual(unchanged);
		expect(await phasesOf(3)).toEqual([
			{ name: "One", checks: null },
			{ name: "Review", checks: ["x"] },
		]);
		expect(await phasesOf(4)).toEqual(once);
	});
});
