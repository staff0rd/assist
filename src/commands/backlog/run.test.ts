import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type { BacklogItem, PlanPhase } from "./types";

vi.mock("./executePhase", () => ({
	executePhase: vi.fn(),
}));

vi.mock("./shared", () => ({
	loadAndFindItem: vi.fn(),
	setStatus: vi.fn(),
}));

import { executePhase } from "./executePhase";
import { run } from "./run";
import { loadAndFindItem, setStatus } from "./shared";

const mockExecutePhase = executePhase as unknown as MockInstance;
const mockLoadAndFindItem = loadAndFindItem as unknown as MockInstance;
const mockSetStatus = setStatus as unknown as MockInstance;

function makeItem(overrides: Partial<BacklogItem> = {}): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "Test item",
		acceptanceCriteria: ["AC1", "AC2"],
		status: "todo",
		plan: [
			{ name: "Phase 1", tasks: [{ task: "Do something" }] },
			{ name: "Phase 2", tasks: [{ task: "Do more" }] },
		],
		...overrides,
	};
}

describe("run", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("when item is not found", () => {
		it("should return without executing any phases", async () => {
			mockLoadAndFindItem.mockReturnValue(undefined);

			await run("99");

			expect(mockExecutePhase).not.toHaveBeenCalled();
			expect(mockSetStatus).not.toHaveBeenCalled();
		});
	});

	describe("when all phases including review are already complete", () => {
		it("should mark done if status is not done", async () => {
			const item = makeItem({ currentPhase: 3, status: "in-progress" });
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });

			await run("1");

			expect(mockSetStatus).toHaveBeenCalledWith("1", "done");
			expect(mockExecutePhase).not.toHaveBeenCalled();
		});

		it("should not mark done if status is already done", async () => {
			const item = makeItem({ currentPhase: 3, status: "done" });
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });

			await run("1");

			expect(mockSetStatus).not.toHaveBeenCalled();
			expect(mockExecutePhase).not.toHaveBeenCalled();
		});
	});

	describe("when authored phases complete and review succeeds", () => {
		it("should execute all authored phases then the review phase", async () => {
			const item = makeItem();
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });
			mockExecutePhase
				.mockResolvedValueOnce(1) // phase 0 -> 1
				.mockResolvedValueOnce(2) // phase 1 -> 2
				.mockResolvedValueOnce(3); // review -> 3

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(3);
		});

		it("should pass the review phase as the last element", async () => {
			const item = makeItem();
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });
			mockExecutePhase
				.mockResolvedValueOnce(1)
				.mockResolvedValueOnce(2)
				.mockResolvedValueOnce(3);

			await run("1");

			const reviewCall = mockExecutePhase.mock.calls[2];
			const phases: PlanPhase[] = reviewCall[2];
			expect(phases[phases.length - 1].name).toBe("Review");
		});

		it("should mark done after review completes", async () => {
			const item = makeItem();
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });
			mockExecutePhase
				.mockResolvedValueOnce(1)
				.mockResolvedValueOnce(2)
				.mockResolvedValueOnce(3);

			await run("1");

			expect(mockSetStatus).toHaveBeenCalledWith("1", "done");
		});
	});

	describe("when an authored phase fails", () => {
		it("should not run the review phase", async () => {
			const item = makeItem();
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });
			mockExecutePhase.mockResolvedValueOnce(-1);

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(1);
		});

		it("should not mark done", async () => {
			const item = makeItem();
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });
			mockExecutePhase.mockResolvedValueOnce(-1);

			await run("1");

			expect(mockSetStatus).toHaveBeenCalledWith("1", "in-progress");
			expect(mockSetStatus).not.toHaveBeenCalledWith("1", "done");
		});
	});

	describe("when the review phase fails", () => {
		it("should not mark done", async () => {
			const item = makeItem();
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });
			mockExecutePhase
				.mockResolvedValueOnce(1)
				.mockResolvedValueOnce(2)
				.mockResolvedValueOnce(-1); // review fails

			await run("1");

			expect(mockSetStatus).toHaveBeenCalledWith("1", "in-progress");
			expect(mockSetStatus).not.toHaveBeenCalledWith("1", "done");
		});
	});

	describe("when resuming from a mid-plan phase", () => {
		it("should skip completed phases", async () => {
			const item = makeItem({ currentPhase: 1 });
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });
			mockExecutePhase
				.mockResolvedValueOnce(2) // phase 1 -> 2
				.mockResolvedValueOnce(3); // review -> 3

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(2);
			expect(mockExecutePhase.mock.calls[0][1]).toBe(1);
		});
	});

	describe("when resuming at the review phase", () => {
		it("should run only the review phase", async () => {
			const item = makeItem({ currentPhase: 2 });
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });
			mockExecutePhase.mockResolvedValueOnce(3);

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(1);
			const reviewCall = mockExecutePhase.mock.calls[0];
			const phases: PlanPhase[] = reviewCall[2];
			expect(phases[phases.length - 1].name).toBe("Review");
		});
	});

	describe("when item has no plan", () => {
		it("should synthesize a plan from acceptance criteria", async () => {
			const item = makeItem({ plan: undefined });
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });
			mockExecutePhase
				.mockResolvedValueOnce(1) // synthesized phase
				.mockResolvedValueOnce(2); // review

			await run("1");

			const firstCall = mockExecutePhase.mock.calls[0];
			const phases: PlanPhase[] = firstCall[2];
			expect(phases[0].name).toBe("Implement");
			expect(phases[0].tasks).toEqual([{ task: "AC1" }, { task: "AC2" }]);
		});
	});
});
