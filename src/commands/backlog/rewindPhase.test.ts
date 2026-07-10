import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("./shared", () => ({
	findOneItem: vi.fn(),
}));

vi.mock("./rewindItemToPhase", () => ({
	rewindItemToPhase: vi.fn(),
}));

import { rewindPhase } from "./rewindPhase";
import { rewindItemToPhase } from "./rewindItemToPhase";
import { findOneItem } from "./shared";

const mockFindOneItem = findOneItem as unknown as MockInstance;
const mockRewind = rewindItemToPhase as unknown as MockInstance;

const orm = {} as never;

describe("rewindPhase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.exitCode = undefined;
	});

	it("should delegate to the shared rewind flow with the loaded item", async () => {
		const item = { id: 1, status: "in-progress", currentPhase: 3 };
		mockFindOneItem.mockResolvedValue({ orm, item });
		mockRewind.mockResolvedValue({ ok: true, phaseName: "Implement" });

		await rewindPhase("a1", "2", { reason: "Need to redo" });

		expect(mockRewind).toHaveBeenCalledWith(orm, item, 2, "Need to redo");
		expect(process.exitCode).toBeUndefined();
	});

	it("should set a failing exit code when the rewind is rejected", async () => {
		mockFindOneItem.mockResolvedValue({
			orm,
			item: { id: 1, status: "in-progress", currentPhase: 2 },
		});
		mockRewind.mockResolvedValue({
			ok: false,
			error: "Phase 2 is not earlier",
		});

		await rewindPhase("a1", "2", { reason: "No reason" });

		expect(process.exitCode).toBe(1);
	});

	it("should do nothing if item is not found", async () => {
		mockFindOneItem.mockResolvedValue(undefined);

		await rewindPhase("a99", "1", { reason: "No reason" });

		expect(mockRewind).not.toHaveBeenCalled();
	});
});
