import { existsSync, readFileSync, unlinkSync } from "node:fs";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type { BacklogItem } from "./types";

vi.mock("./shared", () => ({
	getBacklogDir: () => process.cwd(),
	getReady: vi.fn(),
	setCurrentPhase: vi.fn(),
}));

vi.mock("./loadItem", () => ({
	loadItem: vi.fn(),
}));

vi.mock("./appendComment", () => ({
	appendComment: vi.fn(),
}));

import { appendComment } from "./appendComment";
import { loadItem } from "./loadItem";
import { phaseDone } from "./phaseDone";
import { getReady, setCurrentPhase } from "./shared";
import { clearSignalOwner, recordSignalOwner } from "./recordSignalOwner";
import { getSignalPath } from "./writeSignal";

const mockGetReady = getReady as unknown as MockInstance;
const mockLoadItem = loadItem as unknown as MockInstance;
const mockSetCurrentPhase = setCurrentPhase as unknown as MockInstance;
const mockAppendComment = appendComment as unknown as MockInstance;

const orm = {} as never;

function makeItem(overrides: Partial<BacklogItem> = {}): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "Item",
		acceptanceCriteria: [],
		status: "in-progress",
		starred: false,
		...overrides,
	};
}

function cleanup(): void {
	const path = getSignalPath();
	if (path && existsSync(path)) unlinkSync(path);
}

function signalPath(): string {
	const path = getSignalPath();
	if (!path) throw new Error("expected a signal path");
	return path;
}

describe("phaseDone", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.env.ASSIST_SESSION_ID = "test-session";
		process.exitCode = undefined;
		mockGetReady.mockResolvedValue({ orm });
		mockLoadItem.mockResolvedValue(makeItem());
		recordSignalOwner(1);
		cleanup();
	});

	afterEach(() => {
		cleanup();
		clearSignalOwner(1);
		delete process.env.ASSIST_SESSION_ID;
		process.exitCode = undefined;
	});

	it("should write the status marker file", async () => {
		await phaseDone("a1", "1", "Done");

		const marker = JSON.parse(readFileSync(signalPath(), "utf8"));
		expect(marker.event).toBe("phase-done");
		expect(marker.itemId).toBe(1);
		expect(marker.phaseIndex).toBe(0);
		cleanup();
	});

	it("should advance currentPhase when item is not done", async () => {
		await phaseDone("a1", "1", "Done");

		expect(mockSetCurrentPhase).toHaveBeenCalledWith("a1", 2);
		cleanup();
	});

	it("should write the phase-done signal only after setCurrentPhase resolves", async () => {
		let signalExistedWhenPhaseAdvanced: boolean | undefined;
		mockSetCurrentPhase.mockImplementation(async () => {
			signalExistedWhenPhaseAdvanced = existsSync(signalPath());
		});

		await phaseDone("a1", "1", "Done");

		expect(signalExistedWhenPhaseAdvanced).toBe(false);
		expect(existsSync(signalPath())).toBe(true);
		cleanup();
	});

	it("should store a phase summary as a targeted comment write", async () => {
		await phaseDone("a1", "1", "Implemented the feature");

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
			mockLoadItem.mockResolvedValue(makeItem({ status: "done" }));

			await phaseDone("a1", "1", "Done");

			expect(mockSetCurrentPhase).not.toHaveBeenCalled();
			cleanup();
		});

		it("should skip the summary (already saved by done command)", async () => {
			mockLoadItem.mockResolvedValue(makeItem({ status: "done" }));

			await phaseDone("a1", "3", "Review complete");

			expect(mockAppendComment).not.toHaveBeenCalled();
			cleanup();
		});
	});

	describe("when item does not exist", () => {
		it("should not advance currentPhase or write a summary", async () => {
			mockLoadItem.mockResolvedValue(undefined);

			await phaseDone("a99", "1", "Done");

			expect(mockSetCurrentPhase).not.toHaveBeenCalled();
			expect(mockAppendComment).not.toHaveBeenCalled();
			cleanup();
		});
	});

	describe("when the review phase has incomplete sub-tasks", () => {
		const withPlanAndSubtask = makeItem({
			plan: [{ name: "Implement", tasks: [] }],
			subtasks: [{ title: "Wire it up", status: "todo" }],
		});

		it("should block the review phase and not advance", async () => {
			mockLoadItem.mockResolvedValue(withPlanAndSubtask);

			await phaseDone("a1", "2", "Review complete");

			expect(mockSetCurrentPhase).not.toHaveBeenCalled();
			expect(mockAppendComment).not.toHaveBeenCalled();
			expect(process.exitCode).toBe(1);
			cleanup();
		});

		it("should still allow an intermediate authored phase to complete", async () => {
			mockLoadItem.mockResolvedValue(withPlanAndSubtask);

			await phaseDone("a1", "1", "Phase 1 done");

			expect(mockSetCurrentPhase).toHaveBeenCalledWith("a1", 2);
			cleanup();
		});

		it("should allow the review phase once all sub-tasks are done", async () => {
			mockLoadItem.mockResolvedValue(
				makeItem({
					plan: [{ name: "Implement", tasks: [] }],
					subtasks: [{ title: "Wire it up", status: "done" }],
				}),
			);

			await phaseDone("a1", "2", "Review complete");

			expect(mockSetCurrentPhase).toHaveBeenCalledWith("a1", 3);
			cleanup();
		});
	});
});
