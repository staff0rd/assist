import { existsSync, readFileSync, unlinkSync } from "node:fs";
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
	setCurrentPhase: vi.fn(),
}));

vi.mock("./getItemStatus", () => ({
	getItemStatus: vi.fn(),
}));

vi.mock("./appendComment", () => ({
	appendComment: vi.fn(),
}));

import { appendComment } from "./appendComment";
import { getItemStatus } from "./getItemStatus";
import { phaseDone } from "./phaseDone";
import { getReady, setCurrentPhase } from "./shared";
import { getSignalPath } from "./writeSignal";

const mockGetReady = getReady as unknown as MockInstance;
const mockGetItemStatus = getItemStatus as unknown as MockInstance;
const mockSetCurrentPhase = setCurrentPhase as unknown as MockInstance;
const mockAppendComment = appendComment as unknown as MockInstance;

const orm = {} as never;

function cleanup(): void {
	const path = getSignalPath();
	if (existsSync(path)) unlinkSync(path);
}

describe("phaseDone", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetReady.mockResolvedValue({ orm });
		cleanup();
	});

	it("should write the status marker file", async () => {
		mockGetItemStatus.mockResolvedValue("in-progress");

		await phaseDone("1", "1", "Done");

		const marker = JSON.parse(readFileSync(getSignalPath(), "utf8"));
		expect(marker.event).toBe("phase-done");
		expect(marker.itemId).toBe(1);
		expect(marker.phaseIndex).toBe(0);
		cleanup();
	});

	it("should advance currentPhase when item is not done", async () => {
		mockGetItemStatus.mockResolvedValue("in-progress");

		await phaseDone("1", "1", "Done");

		expect(mockSetCurrentPhase).toHaveBeenCalledWith("1", 2);
		cleanup();
	});

	it("should store a phase summary as a targeted comment write", async () => {
		mockGetItemStatus.mockResolvedValue("in-progress");

		await phaseDone("1", "1", "Implemented the feature");

		expect(mockAppendComment).toHaveBeenCalledWith(
			orm,
			1,
			"Implemented the feature",
			{ phase: 1, type: "summary" },
		);
		cleanup();
	});

	describe("when item is already done", () => {
		it("should not advance currentPhase", async () => {
			mockGetItemStatus.mockResolvedValue("done");

			await phaseDone("1", "1", "Done");

			expect(mockSetCurrentPhase).not.toHaveBeenCalled();
			cleanup();
		});

		it("should skip the summary (already saved by done command)", async () => {
			mockGetItemStatus.mockResolvedValue("done");

			await phaseDone("1", "3", "Review complete");

			expect(mockAppendComment).not.toHaveBeenCalled();
			cleanup();
		});
	});

	describe("when item does not exist", () => {
		it("should not advance currentPhase or write a summary", async () => {
			mockGetItemStatus.mockResolvedValue(undefined);

			await phaseDone("99", "1", "Done");

			expect(mockSetCurrentPhase).not.toHaveBeenCalled();
			expect(mockAppendComment).not.toHaveBeenCalled();
			cleanup();
		});
	});
});
