import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("../shared", () => ({
	loadAndFindItem: vi.fn(),
	saveBacklog: vi.fn(),
}));

vi.mock("../addComment", () => ({
	addPhaseSummary: vi.fn(),
}));

import { addPhaseSummary } from "../addComment";
import { loadAndFindItem, saveBacklog } from "../shared";
import { done } from "./index";

const mockLoadAndFindItem = loadAndFindItem as unknown as MockInstance;
const mockSaveBacklog = saveBacklog as unknown as MockInstance;
const mockAddPhaseSummary = addPhaseSummary as unknown as MockInstance;

describe("done", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.exitCode = undefined;
	});

	it("should mark an item without a plan as done", async () => {
		const items = [{ id: 1, name: "Task", status: "in-progress" }];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		await done("1");

		expect(items[0].status).toBe("done");
		expect(mockSaveBacklog).toHaveBeenCalledWith(items);
	});

	it("should mark an item with all phases completed as done", async () => {
		const items = [
			{
				id: 1,
				name: "Task",
				status: "in-progress",
				plan: [{ name: "Phase 1", tasks: [] }],
				currentPhase: 2,
			},
		];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		await done("1");

		expect(items[0].status).toBe("done");
		expect(mockSaveBacklog).toHaveBeenCalledWith(items);
	});

	it("should reject completion when phases are pending", async () => {
		const items = [
			{
				id: 1,
				name: "Task",
				status: "in-progress",
				plan: [
					{ name: "Implement", tasks: [] },
					{ name: "Review", tasks: [] },
				],
				currentPhase: 1,
			},
		];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		await done("1");

		expect(items[0].status).toBe("in-progress");
		expect(mockSaveBacklog).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);
	});

	it("should list pending phase names", async () => {
		const consoleSpy = vi.spyOn(console, "log");
		const items = [
			{
				id: 1,
				name: "Task",
				status: "in-progress",
				plan: [
					{ name: "Implement", tasks: [] },
					{ name: "Review", tasks: [] },
					{ name: "Deploy", tasks: [] },
				],
				currentPhase: 2,
			},
		];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		await done("1");

		const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
		expect(output).toContain("Review");
		expect(output).toContain("Deploy");
		expect(output).toContain("2 pending phase(s)");
		consoleSpy.mockRestore();
	});

	it("should treat missing currentPhase as 0 phases completed", async () => {
		const items = [
			{
				id: 1,
				name: "Task",
				status: "in-progress",
				plan: [{ name: "Phase 1", tasks: [] }],
			},
		];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		await done("1");

		expect(items[0].status).toBe("in-progress");
		expect(mockSaveBacklog).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);
	});

	it("should store a phase summary when provided", async () => {
		const items = [
			{
				id: 1,
				name: "Task",
				status: "in-progress",
				currentPhase: 3,
				plan: [
					{ name: "A", tasks: [] },
					{ name: "B", tasks: [] },
				],
			},
		];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		await done("1", "All done");

		expect(mockAddPhaseSummary).toHaveBeenCalledWith(items[0], "All done", 3);
	});

	it("should allow completion with an empty plan", async () => {
		const items = [{ id: 1, name: "Task", status: "in-progress", plan: [] }];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		await done("1");

		expect(items[0].status).toBe("done");
		expect(mockSaveBacklog).toHaveBeenCalled();
	});
});
