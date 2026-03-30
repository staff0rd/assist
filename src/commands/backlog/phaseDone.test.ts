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
	loadAndFindItem: vi.fn(),
	saveBacklog: vi.fn(),
	setCurrentPhase: vi.fn(),
}));

vi.mock("./addComment", () => ({
	addPhaseSummary: vi.fn(),
}));

import { addPhaseSummary } from "./addComment";
import { phaseDone } from "./phaseDone";
import { loadAndFindItem, saveBacklog, setCurrentPhase } from "./shared";
import { getSignalPath } from "./writeSignal";

const mockLoadAndFindItem = loadAndFindItem as unknown as MockInstance;
const mockSetCurrentPhase = setCurrentPhase as unknown as MockInstance;
const mockAddPhaseSummary = addPhaseSummary as unknown as MockInstance;
const mockSaveBacklog = saveBacklog as unknown as MockInstance;

function cleanup(): void {
	const path = getSignalPath();
	if (existsSync(path)) unlinkSync(path);
}

describe("phaseDone", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		cleanup();
	});

	it("should write the status marker file", () => {
		mockLoadAndFindItem.mockReturnValue({
			items: [],
			item: { id: 1, status: "in-progress" },
		});

		phaseDone("1", "0", "Done");

		const marker = JSON.parse(readFileSync(getSignalPath(), "utf-8"));
		expect(marker.event).toBe("phase-done");
		expect(marker.itemId).toBe(1);
		expect(marker.phaseIndex).toBe(0);
		cleanup();
	});

	it("should advance currentPhase when item is not done", () => {
		mockLoadAndFindItem.mockReturnValue({
			items: [],
			item: { id: 1, status: "in-progress" },
		});

		phaseDone("1", "0", "Done");

		expect(mockSetCurrentPhase).toHaveBeenCalledWith("1", 1);
		cleanup();
	});

	it("should store a phase summary when summary is provided", () => {
		const items = [{ id: 1, status: "in-progress" }];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		phaseDone("1", "0", "Implemented the feature");

		expect(mockAddPhaseSummary).toHaveBeenCalledWith(
			items[0],
			"Implemented the feature",
			0,
		);
		expect(mockSaveBacklog).toHaveBeenCalledWith(items);
		cleanup();
	});

	it("should always store a summary", () => {
		const items = [{ id: 1, status: "in-progress" }];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		phaseDone("1", "0", "Completed phase");

		expect(mockAddPhaseSummary).toHaveBeenCalledWith(
			items[0],
			"Completed phase",
			0,
		);
		expect(mockSaveBacklog).toHaveBeenCalledWith(items);
		cleanup();
	});

	describe("when item is already done", () => {
		it("should not advance currentPhase", () => {
			mockLoadAndFindItem.mockReturnValue({
				items: [],
				item: { id: 1, status: "done" },
			});

			phaseDone("1", "0", "Done");

			expect(mockSetCurrentPhase).not.toHaveBeenCalled();
			cleanup();
		});

		it("should skip the summary (already saved by done command)", () => {
			const items = [{ id: 1, status: "done" }];
			mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

			phaseDone("1", "2", "Review complete");

			expect(mockAddPhaseSummary).not.toHaveBeenCalled();
			expect(mockSaveBacklog).not.toHaveBeenCalled();
			cleanup();
		});
	});
});
