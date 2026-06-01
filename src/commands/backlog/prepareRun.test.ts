import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type { BacklogItem } from "./types";

vi.mock("./shared", () => ({
	loadAndFindItem: vi.fn(),
	setStatus: vi.fn(),
}));

import { prepareRun } from "./prepareRun";
import { loadAndFindItem, setStatus } from "./shared";

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

describe("prepareRun", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("when item is not found", () => {
		it("returns undefined", async () => {
			mockLoadAndFindItem.mockReturnValue(undefined);

			expect(await prepareRun("99")).toBeUndefined();
		});
	});

	describe("when item is already done", () => {
		it("returns undefined without updating status", async () => {
			const item = makeItem({ currentPhase: 2, status: "done" });
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });

			expect(await prepareRun("1")).toBeUndefined();
			expect(mockSetStatus).not.toHaveBeenCalled();
		});

		it("returns undefined even when currentPhase exceeds plan length", async () => {
			const item = makeItem({ currentPhase: 4, status: "done" });
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });

			expect(await prepareRun("1")).toBeUndefined();
			expect(mockSetStatus).not.toHaveBeenCalled();
		});
	});

	describe("when all phases including review are already complete", () => {
		it("marks done and returns undefined", async () => {
			const item = makeItem({ currentPhase: 4, status: "in-progress" });
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });

			expect(await prepareRun("1")).toBeUndefined();
			expect(mockSetStatus).toHaveBeenCalledWith("1", "done");
		});
	});

	describe("when item is ready to run", () => {
		it("returns item, plan, and startPhase", async () => {
			const item = makeItem();
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });

			const result = await prepareRun("1");

			expect(result).toEqual({
				item,
				plan: item.plan,
				startPhase: 0,
			});
		});

		it("defaults startPhase to 0 when currentPhase is undefined", async () => {
			const item = makeItem({ currentPhase: undefined });
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });

			const result = await prepareRun("1");

			expect(result?.startPhase).toBe(0);
		});

		it("uses currentPhase as startPhase when resuming", async () => {
			const item = makeItem({ currentPhase: 2 });
			mockLoadAndFindItem.mockReturnValue({ items: [item], item });

			const result = await prepareRun("1");

			expect(result?.startPhase).toBe(1);
		});
	});
});
