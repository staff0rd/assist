import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeBacklogItem } from "../../test/mothers/makeBacklogItem";

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));
vi.mock("./ensureStoryBranch", () => ({ ensureStoryBranch: vi.fn() }));
vi.mock("./discardStalePause", () => ({ discardStalePause: vi.fn() }));
vi.mock("./phaseRun/clearFailedPhases", () => ({ clearFailedPhases: vi.fn() }));
vi.mock("./phaseRun/failOrphanedPhases", () => ({
	failOrphanedPhases: vi.fn(),
}));
vi.mock("./shared", () => ({ setStatus: vi.fn() }));
vi.mock("./phaseRun/isWake", () => ({ isWake: vi.fn(() => false) }));

import { clearFailedPhases } from "./phaseRun/clearFailedPhases";
import { failOrphanedPhases } from "./phaseRun/failOrphanedPhases";
import { isWake } from "./phaseRun/isWake";
import { readyRunStart } from "./readyRunStart";
import { setStatus } from "./shared";

describe("readyRunStart", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(isWake).mockReturnValue(false);
	});

	it("retries failed phases on a fresh run", async () => {
		const item = makeBacklogItem({ status: "todo" });
		await expect(readyRunStart("a1", item, undefined)).resolves.toBe(true);
		expect(setStatus).toHaveBeenCalledWith("a1", "in-progress");
		expect(clearFailedPhases).toHaveBeenCalledWith(1);
		expect(failOrphanedPhases).not.toHaveBeenCalled();
	});

	it("keeps failed phases and fails orphans when the daemon wakes the run", async () => {
		vi.mocked(isWake).mockReturnValue(true);
		const item = makeBacklogItem({ status: "in-progress" });
		await expect(readyRunStart("a1", item, undefined)).resolves.toBe(true);
		expect(failOrphanedPhases).toHaveBeenCalledWith(1);
		expect(clearFailedPhases).not.toHaveBeenCalled();
	});

	it("does nothing when woken after the run was stopped", async () => {
		vi.mocked(isWake).mockReturnValue(true);
		const item = makeBacklogItem({ status: "todo" });
		await expect(readyRunStart("a1", item, undefined)).resolves.toBe(false);
		expect(setStatus).not.toHaveBeenCalled();
	});
});
