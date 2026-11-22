import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items, planPhases, planTasks } from "../../shared/db/schema";
import { addPhase } from "./addPhase";
import { loadItem } from "./loadItem";
import { removePhase } from "./removePhase";
import { updatePhase } from "./updatePhase";
import { replacePlan } from "./updatePlan/replacePlan";

let orm: Db;
let close: () => Promise<void>;

vi.mock("./ensureRemoteOrigin", () => ({ ensureRemoteOrigin: () => true }));

vi.mock("./shared", () => ({
	getOrigin: () => "test",
	findOneItem: async () => ({ orm, item: await loadItem(orm, 1) }),
}));

type SeedPhase = { name: string; checks?: string[] };

async function seed(phases: SeedPhase[]): Promise<void> {
	await orm
		.insert(items)
		.values({ id: 1, origin: "test", name: "Fold", status: "todo" });
	await orm.insert(planPhases).values(
		phases.map(({ name, checks }, idx) => ({
			itemId: 1,
			idx,
			name,
			manualChecks: checks ? JSON.stringify(checks) : null,
		})),
	);
	await orm
		.insert(planTasks)
		.values(
			phases.map((_, idx) => ({ itemId: 1, phaseIdx: idx, idx: 0, task: "t" })),
		);
}

async function plan() {
	const item = await loadItem(orm, 1);
	return (item?.plan ?? []).map(({ name, manualChecks }) => ({
		name,
		checks: manualChecks,
	}));
}

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	vi.spyOn(console, "log").mockImplementation(() => {});
	delete process.env.ASSIST_SESSION;
});

afterEach(async () => {
	await close();
	vi.restoreAllMocks();
});

describe("plan writes fold the last authored phase's checks into Review", () => {
	it("add-phase stores a new last phase's checks on a new Review phase", async () => {
		await seed([{ name: "A", checks: ["a1"] }]);

		await addPhase("a1", "B", { task: ["t"], manualCheck: ["b1", "b2"] });

		expect(await plan()).toEqual([
			{ name: "A", checks: ["a1"] },
			{ name: "B", checks: undefined },
			{ name: "Review", checks: ["b1", "b2"] },
		]);
	});

	it("add-phase appends after checks already bumped onto Review", async () => {
		await seed([
			{ name: "A", checks: ["a1"] },
			{ name: "Review", checks: ["bumped"] },
		]);

		await addPhase("a1", "B", { task: ["t"], manualCheck: ["b1"] });

		expect(await plan()).toEqual([
			{ name: "A", checks: ["a1"] },
			{ name: "B", checks: undefined },
			{ name: "Review", checks: ["bumped", "b1"] },
		]);
	});

	it("add-phase inserting before the last phase moves nothing", async () => {
		await seed([{ name: "A" }]);

		await addPhase("a1", "Z", {
			task: ["t"],
			manualCheck: ["z1"],
			position: "1",
		});

		expect(await plan()).toEqual([
			{ name: "Z", checks: ["z1"] },
			{ name: "A", checks: undefined },
		]);
	});

	it("update-phase on the last authored phase stores its checks on Review", async () => {
		await seed([
			{ name: "A", checks: ["a1"] },
			{ name: "B" },
			{ name: "Review", checks: ["bumped"] },
		]);

		await updatePhase("a1", "2", { manualCheck: ["b1", "b2"] });

		expect(await plan()).toEqual([
			{ name: "A", checks: ["a1"] },
			{ name: "B", checks: undefined },
			{ name: "Review", checks: ["bumped", "b1", "b2"] },
		]);
	});

	it("update-phase on an earlier phase keeps its checks", async () => {
		await seed([{ name: "A" }, { name: "B" }]);

		await updatePhase("a1", "1", { manualCheck: ["a1"] });

		expect(await plan()).toEqual([
			{ name: "A", checks: ["a1"] },
			{ name: "B", checks: undefined },
		]);
	});

	it("remove-phase folds the checks of the phase left last", async () => {
		await seed([
			{ name: "A", checks: ["a1"] },
			{ name: "B", checks: ["b1", "b2"] },
			{ name: "C" },
			{ name: "Review", checks: ["bumped"] },
		]);

		await removePhase("a1", "3");

		expect(await plan()).toEqual([
			{ name: "A", checks: ["a1"] },
			{ name: "B", checks: undefined },
			{ name: "Review", checks: ["bumped", "b1", "b2"] },
		]);
	});

	it("update-plan keeps bumped Review checks and appends the last phase's", async () => {
		await seed([{ name: "Old" }, { name: "Review", checks: ["bumped"] }]);

		await replacePlan(
			orm,
			1,
			[
				{ name: "A", tasks: ["t"], manualChecks: ["a1"] },
				{ name: "B", tasks: ["t"], manualChecks: ["b1", "b2"] },
			],
			undefined,
		);

		expect(await plan()).toEqual([
			{ name: "A", checks: ["a1"] },
			{ name: "B", checks: undefined },
			{ name: "Review", checks: ["bumped", "b1", "b2"] },
		]);
	});

	it("update-plan stores no Review phase when nothing needs folding", async () => {
		await seed([{ name: "Old" }]);

		await replacePlan(
			orm,
			1,
			[{ name: "A", tasks: ["t"], manualChecks: [] }],
			undefined,
		);

		expect(await plan()).toEqual([{ name: "A", checks: undefined }]);
	});
});
