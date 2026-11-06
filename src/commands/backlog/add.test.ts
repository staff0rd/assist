import { asc, eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items, planPhases, planTasks } from "../../shared/db/schema";
import { loadConfig } from "../../shared/loadConfig";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { add } from "./add";
import { insertPhaseAt } from "./insertPhaseAt";

let orm: Db;
let close: () => Promise<void>;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

let remoteOrigin = true;
let agentHarness = false;

vi.mock("./shared", () => ({
	getOrigin: () => "test",
}));

vi.mock("../../lib/isAgentHarness", () => ({
	isAgentHarness: () => agentHarness,
}));

vi.mock("./ensureRemoteOrigin", () => ({
	ensureRemoteOrigin: () => remoteOrigin,
}));

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockLoadConfig = vi.mocked(loadConfig);

function getPhases(itemId: number) {
	return orm
		.select({ idx: planPhases.idx, name: planPhases.name })
		.from(planPhases)
		.where(eq(planPhases.itemId, itemId))
		.orderBy(asc(planPhases.idx));
}

function getTasks(itemId: number) {
	return orm
		.select({
			phaseIdx: planTasks.phaseIdx,
			idx: planTasks.idx,
			task: planTasks.task,
		})
		.from(planTasks)
		.where(eq(planTasks.itemId, itemId))
		.orderBy(asc(planTasks.phaseIdx), asc(planTasks.idx));
}

async function onlyItemId(): Promise<number> {
	const [row] = await orm.select({ id: items.id }).from(items);
	return row.id;
}

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	mockLoadConfig.mockReturnValue(makeAssistConfig());
	remoteOrigin = true;
	agentHarness = false;
	process.exitCode = 0;
});

afterEach(async () => {
	await close();
	vi.restoreAllMocks();
	process.exitCode = 0;
});

describe("add", () => {
	it("gives a new bug a stored 'Fix' phase as phase 1", async () => {
		await add({ type: "bug", name: "Broken", desc: "", ac: [] });

		const id = await onlyItemId();
		expect(await getPhases(id)).toEqual([{ idx: 0, name: "Fix" }]);
		expect(await getTasks(id)).toEqual([
			{ phaseIdx: 0, idx: 0, task: "Fix the bug" },
		]);
	});

	it("does not auto-add a phase for a story", async () => {
		await add({ type: "story", name: "Feature", desc: "", ac: [] });

		const id = await onlyItemId();
		expect(await getPhases(id)).toEqual([]);
	});

	it("stores a later-added phase after the 'Fix' phase", async () => {
		await add({ type: "bug", name: "Broken", desc: "", ac: [] });

		const id = await onlyItemId();
		await insertPhaseAt(orm, id, 1, "Review", ["Review it"], null, undefined);

		expect(await getPhases(id)).toEqual([
			{ idx: 0, name: "Fix" },
			{ idx: 1, name: "Review" },
		]);
	});

	it("refuses an agent invocation, pointing at propose", async () => {
		agentHarness = true;
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		await add({ type: "story", name: "Feature", desc: "", ac: [] });

		expect(errorSpy.mock.calls.map((c) => c.join(" ")).join("\n")).toContain(
			"assist backlog propose --json",
		);
		expect(process.exitCode).toBe(1);
		expect(await orm.select({ id: items.id }).from(items)).toEqual([]);
	});

	it("refuses to add an item when there is no git remote", async () => {
		remoteOrigin = false;

		await add({ type: "story", name: "Feature", desc: "", ac: [] });

		expect(await orm.select({ id: items.id }).from(items)).toEqual([]);
	});
});
