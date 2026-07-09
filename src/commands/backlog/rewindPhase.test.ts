import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("./shared", () => ({
	getBacklogDir: () => process.cwd(),
	getReady: vi.fn(),
}));

vi.mock("./loadItem", () => ({
	loadItem: vi.fn(),
}));

vi.mock("./rewindItemToPhase", () => ({
	rewindItemToPhase: vi.fn(),
}));

import { loadItem } from "./loadItem";
import { rewindPhase } from "./rewindPhase";
import { rewindItemToPhase } from "./rewindItemToPhase";
import { getReady } from "./shared";

const mockGetReady = getReady as unknown as MockInstance;
const mockLoadItem = loadItem as unknown as MockInstance;
const mockRewind = rewindItemToPhase as unknown as MockInstance;

const orm = {} as never;

describe("rewindPhase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetReady.mockResolvedValue({ orm });
		process.exitCode = undefined;
	});

	it("should delegate to the shared rewind flow with the loaded item", async () => {
		const item = { id: 1, status: "in-progress", currentPhase: 3 };
		mockLoadItem.mockResolvedValue(item);
		mockRewind.mockResolvedValue({ ok: true, phaseName: "Implement" });

		await rewindPhase("1", "2", { reason: "Need to redo" });

		expect(mockRewind).toHaveBeenCalledWith(orm, item, 2, "Need to redo");
		expect(process.exitCode).toBeUndefined();
	});

	it("should set a failing exit code when the rewind is rejected", async () => {
		mockLoadItem.mockResolvedValue({
			id: 1,
			status: "in-progress",
			currentPhase: 2,
		});
		mockRewind.mockResolvedValue({
			ok: false,
			error: "Phase 2 is not earlier",
		});

		await rewindPhase("1", "2", { reason: "No reason" });

		expect(process.exitCode).toBe(1);
	});

	it("should do nothing if item is not found", async () => {
		mockLoadItem.mockResolvedValue(undefined);

		await rewindPhase("99", "1", { reason: "No reason" });

		expect(mockRewind).not.toHaveBeenCalled();
	});
});
