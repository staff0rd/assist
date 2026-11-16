import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeBacklogItem } from "../../../test/mothers/makeBacklogItem";

vi.mock("./launchParallelPhase", () => ({
	launchParallelPhase: vi.fn(async () => true),
}));

import { launchParallelPhase } from "./launchParallelPhase";
import { launchReady } from "./launchReady";

const item = makeBacklogItem();

function schedule(running: number[], ready: number[]) {
	return { allDone: false, running, ready, failed: [] };
}

describe("launchReady", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(launchParallelPhase).mockResolvedValue(true);
	});

	it("starts ready phases up to the cap and leaves the rest queued", async () => {
		await expect(
			launchReady(item, schedule([], [1, 2, 3, 4]), 3, "/t"),
		).resolves.toBe(3);
		expect(vi.mocked(launchParallelPhase).mock.calls.map((c) => c[1])).toEqual([
			1, 2, 3,
		]);
	});

	it("counts phases already running against the cap", async () => {
		await launchReady(item, schedule([1, 2], [3, 4]), 3, "/t");
		expect(vi.mocked(launchParallelPhase).mock.calls.map((c) => c[1])).toEqual([
			3,
		]);
	});

	it("drops the cap to 1 when a launch fails", async () => {
		vi.mocked(launchParallelPhase).mockResolvedValue(false);
		await expect(
			launchReady(item, schedule([], [1, 2]), 3, "/t"),
		).resolves.toBe(1);
		expect(launchParallelPhase).toHaveBeenCalledTimes(1);
	});
});
