import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("../shared", () => ({
	findOneItem: vi.fn(),
}));

vi.mock("../updateStatus", () => ({
	updateStatus: vi.fn(),
}));

vi.mock("../appendComment", () => ({
	appendComment: vi.fn(),
}));

import { appendComment } from "../appendComment";
import { findOneItem } from "../shared";
import { updateStatus } from "../updateStatus";
import { done } from "./index";

const mockFindOneItem = findOneItem as unknown as MockInstance;
const mockUpdateStatus = updateStatus as unknown as MockInstance;
const mockAppendComment = appendComment as unknown as MockInstance;

const orm = {} as never;

// biome-ignore lint/suspicious/noExplicitAny: test fixtures use partial items
function found(item: any) {
	return { orm, item };
}

describe("done", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.exitCode = undefined;
	});

	it("should mark an item without a plan as done", async () => {
		const item = { id: 1, name: "Task", status: "in-progress" };
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1");

		expect(mockUpdateStatus).toHaveBeenCalledWith(orm, 1, "done");
	});

	it("should mark an item with all phases completed as done", async () => {
		const item = {
			id: 1,
			name: "Task",
			status: "in-progress",
			plan: [{ name: "Phase 1", tasks: [] }],
			currentPhase: 2,
		};
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1");

		expect(mockUpdateStatus).toHaveBeenCalledWith(orm, 1, "done");
	});

	it("should reject completion when phases are pending", async () => {
		const item = {
			id: 1,
			name: "Task",
			status: "in-progress",
			plan: [
				{ name: "Implement", tasks: [] },
				{ name: "Review", tasks: [] },
			],
			currentPhase: 1,
		};
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1");

		expect(mockUpdateStatus).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);
	});

	it("should list pending phase names", async () => {
		const consoleSpy = vi.spyOn(console, "log");
		const item = {
			id: 1,
			name: "Task",
			status: "in-progress",
			plan: [
				{ name: "Implement", tasks: [] },
				{ name: "Review", tasks: [] },
				{ name: "Deploy", tasks: [] },
			],
			currentPhase: 2,
		};
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1");

		const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
		expect(output).toContain("Review");
		expect(output).toContain("Deploy");
		expect(output).toContain("2 pending phase(s)");
		consoleSpy.mockRestore();
	});

	it("should treat missing currentPhase as 0 phases completed", async () => {
		const item = {
			id: 1,
			name: "Task",
			status: "in-progress",
			plan: [{ name: "Phase 1", tasks: [] }],
		};
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1");

		expect(mockUpdateStatus).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);
	});

	it("should store a phase summary when provided", async () => {
		const item = {
			id: 1,
			name: "Task",
			status: "in-progress",
			currentPhase: 3,
			plan: [
				{ name: "A", tasks: [] },
				{ name: "B", tasks: [] },
			],
		};
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1", "All done");

		expect(mockAppendComment).toHaveBeenCalledWith(orm, 1, "All done", {
			phase: 3,
			type: "summary",
		});
	});

	it("should allow completion with an empty plan", async () => {
		const item = { id: 1, name: "Task", status: "in-progress", plan: [] };
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1");

		expect(mockUpdateStatus).toHaveBeenCalledWith(orm, 1, "done");
	});
});
