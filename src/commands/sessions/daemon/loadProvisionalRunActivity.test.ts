import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "../../../shared/db/getDb";
import { loadConfig } from "../../../shared/loadConfig";
import type * as loadConfigMockModule from "../../../test/mocks/loadConfigMock";
import { makeAssistConfig } from "../../../test/mothers/makeAssistConfig";
import { makeBacklogItem } from "../../../test/mothers/makeBacklogItem";
import { loadItem } from "../../backlog/loadItem";
import { daemonLog } from "./daemonLog";
import { loadProvisionalRunActivity } from "./loadProvisionalRunActivity";

vi.mock("../../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);
vi.mock("../../../shared/db/getDb", () => ({ getDb: vi.fn() }));
vi.mock("../../backlog/loadItem", () => ({ loadItem: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const plan = [{ name: "Build API", tasks: [] }];

describe("loadProvisionalRunActivity", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv("ASSIST_DATABASE_URL", "postgres://db");
		vi.mocked(getDb).mockResolvedValue({} as never);
	});

	it("returns the activity for an item with a phase left to run", async () => {
		vi.mocked(loadItem).mockResolvedValue(
			makeBacklogItem({ id: 825, name: "Story", plan }),
		);

		expect(await loadProvisionalRunActivity(825)).toMatchObject({
			itemId: 825,
			itemName: "Story",
			phase: 1,
			phaseName: "Build API",
			totalPhases: 2,
		});
		expect(daemonLog).not.toHaveBeenCalled();
	});

	it("skips without a configured database", async () => {
		vi.stubEnv("ASSIST_DATABASE_URL", "");
		vi.mocked(loadConfig).mockReturnValue(makeAssistConfig());

		expect(await loadProvisionalRunActivity(825)).toBeUndefined();
		expect(getDb).not.toHaveBeenCalled();
		expect(daemonLog).toHaveBeenCalledWith(
			"provisional activity for a825 skipped: no database configured",
		);
	});

	it("skips an unknown item", async () => {
		vi.mocked(loadItem).mockResolvedValue(undefined);

		expect(await loadProvisionalRunActivity(825)).toBeUndefined();
		expect(daemonLog).toHaveBeenCalledWith(
			"provisional activity for a825 skipped: item not found",
		);
	});

	it.each([
		["a done item", makeBacklogItem({ plan, status: "done" })],
		["an item past its review", makeBacklogItem({ plan, currentPhase: 3 })],
	])("skips %s", async (_label, item) => {
		vi.mocked(loadItem).mockResolvedValue(item);

		expect(await loadProvisionalRunActivity(825)).toBeUndefined();
		expect(daemonLog).toHaveBeenCalledWith(
			"provisional activity for a825 skipped: no phase left to run",
		);
	});

	it.each([
		[
			"the connection fails",
			() => vi.mocked(getDb).mockRejectedValue(new Error("ECONNREFUSED")),
		],
		[
			"the query fails",
			() => vi.mocked(loadItem).mockRejectedValue(new Error("ECONNREFUSED")),
		],
	])("logs and returns nothing when %s", async (_label, fail) => {
		fail();

		expect(await loadProvisionalRunActivity(825)).toBeUndefined();
		expect(daemonLog).toHaveBeenCalledWith(
			"provisional activity for a825 lookup failed: Error: ECONNREFUSED",
		);
	});
});
