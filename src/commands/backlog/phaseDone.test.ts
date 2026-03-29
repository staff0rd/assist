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
	setCurrentPhase: vi.fn(),
}));

import { getPhaseStatusPath, phaseDone } from "./phaseDone";
import { loadAndFindItem, setCurrentPhase } from "./shared";

const mockLoadAndFindItem = loadAndFindItem as unknown as MockInstance;
const mockSetCurrentPhase = setCurrentPhase as unknown as MockInstance;

function cleanup(): void {
	const path = getPhaseStatusPath();
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

		phaseDone("1", "0");

		const marker = JSON.parse(readFileSync(getPhaseStatusPath(), "utf-8"));
		expect(marker.itemId).toBe(1);
		expect(marker.phaseIndex).toBe(0);
		cleanup();
	});

	it("should advance currentPhase when item is not done", () => {
		mockLoadAndFindItem.mockReturnValue({
			items: [],
			item: { id: 1, status: "in-progress" },
		});

		phaseDone("1", "0");

		expect(mockSetCurrentPhase).toHaveBeenCalledWith("1", 1);
		cleanup();
	});

	describe("when item is already done", () => {
		it("should not advance currentPhase", () => {
			mockLoadAndFindItem.mockReturnValue({
				items: [],
				item: { id: 1, status: "done" },
			});

			phaseDone("1", "0");

			expect(mockSetCurrentPhase).not.toHaveBeenCalled();
			cleanup();
		});
	});
});
