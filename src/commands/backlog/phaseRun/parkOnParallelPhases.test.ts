import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeBacklogItem } from "../../../test/mothers/makeBacklogItem";

vi.mock("../../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));
vi.mock("../shared", () => ({ getReady: vi.fn(async () => ({ orm: {} })) }));
vi.mock("./announceWaiting", () => ({ announceWaiting: vi.fn() }));
vi.mock("./launchReady", () => ({ launchReady: vi.fn(async () => 3) }));
vi.mock("./loadPhaseProgress", () => ({ loadPhaseProgress: vi.fn() }));

import { announceWaiting } from "./announceWaiting";
import { launchReady } from "./launchReady";
import { loadPhaseProgress } from "./loadPhaseProgress";
import { parkOnParallelPhases } from "./parkOnParallelPhases";

const item = makeBacklogItem();
const plan = [1, 2, 3].map((n) => ({ name: `P${n}`, tasks: [] }));
const schedule = { allDone: false, running: [], ready: [1, 2], failed: [] };

function progress(running: number[]) {
	vi.mocked(loadPhaseProgress).mockResolvedValue({
		currentPhase: 2,
		running,
		done: [0],
		failed: [],
	});
}

describe("parkOnParallelPhases", () => {
	beforeEach(() => vi.clearAllMocks());

	it("starts the ready phases and parks while they run", async () => {
		progress([1, 2]);
		const state = { cap: 3, pauseRequested: false, itemTree: "/tree" };
		await expect(
			parkOnParallelPhases(item, plan, schedule, state),
		).resolves.toBe(true);
		expect(launchReady).toHaveBeenCalled();
		expect(announceWaiting).toHaveBeenCalledWith(item, [1, 2], 4);
	});

	it("does not park when no phase ended up running", async () => {
		progress([]);
		const state = { cap: 3, pauseRequested: false, itemTree: "/tree" };
		await expect(
			parkOnParallelPhases(item, plan, schedule, state),
		).resolves.toBe(false);
	});

	it("starts nothing new once a pause is requested", async () => {
		progress([1]);
		const state = { cap: 3, pauseRequested: true, itemTree: "/tree" };
		await expect(
			parkOnParallelPhases(item, plan, schedule, state),
		).resolves.toBe(true);
		expect(launchReady).not.toHaveBeenCalled();
	});
});
