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
	loadAndFindItem: vi.fn(),
	saveBacklog: vi.fn(),
	setCurrentPhase: vi.fn(),
	setStatus: vi.fn(),
}));

vi.mock("./addComment", () => ({
	addComment: vi.fn(),
}));

vi.mock("./writeSignal", () => ({
	writeSignal: vi.fn(),
}));

import { addComment } from "./addComment";
import { rewindPhase } from "./rewindPhase";
import {
	loadAndFindItem,
	saveBacklog,
	setCurrentPhase,
	setStatus,
} from "./shared";
import { writeSignal } from "./writeSignal";

const mockLoadAndFindItem = loadAndFindItem as unknown as MockInstance;
const mockSetCurrentPhase = setCurrentPhase as unknown as MockInstance;
const mockSetStatus = setStatus as unknown as MockInstance;
const mockAddComment = addComment as unknown as MockInstance;
const mockSaveBacklog = saveBacklog as unknown as MockInstance;
const mockWriteSignal = writeSignal as unknown as MockInstance;

describe("rewindPhase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.exitCode = undefined;
	});

	it("should rewind currentPhase and set status to in-progress", () => {
		const items = [
			{
				id: 1,
				status: "in-progress",
				currentPhase: 2,
				plan: [
					{ name: "Phase 0", tasks: [] },
					{ name: "Phase 1", tasks: [] },
					{ name: "Phase 2", tasks: [] },
				],
			},
		];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		rewindPhase("1", "1", { reason: "Need to redo" });

		expect(mockSetCurrentPhase).toHaveBeenCalledWith("1", 1);
		expect(mockSetStatus).toHaveBeenCalledWith("1", "in-progress");
	});

	it("should write a rewind signal to terminate the session", () => {
		const items = [
			{
				id: 1,
				status: "in-progress",
				currentPhase: 2,
				plan: [
					{ name: "Phase 0", tasks: [] },
					{ name: "Phase 1", tasks: [] },
					{ name: "Phase 2", tasks: [] },
				],
			},
		];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		rewindPhase("1", "1", { reason: "Need to redo" });

		expect(mockWriteSignal).toHaveBeenCalledWith("rewind", {
			itemId: 1,
			targetPhase: 1,
		});
	});

	it("should add a comment recording the rewind", () => {
		const items = [
			{
				id: 1,
				status: "in-progress",
				currentPhase: 2,
				plan: [
					{ name: "Phase 0", tasks: [] },
					{ name: "Phase 1", tasks: [] },
					{ name: "Phase 2", tasks: [] },
				],
			},
		];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		rewindPhase("1", "0", { reason: "Tests failed" });

		expect(mockAddComment).toHaveBeenCalledWith(
			items[0],
			"Rewound to phase 0 (Phase 0): Tests failed",
			0,
		);
		expect(mockSaveBacklog).toHaveBeenCalledWith(items);
	});

	it("should reject if target phase is not earlier than current", () => {
		const items = [
			{
				id: 1,
				status: "in-progress",
				currentPhase: 1,
				plan: [
					{ name: "Phase 0", tasks: [] },
					{ name: "Phase 1", tasks: [] },
					{ name: "Phase 2", tasks: [] },
				],
			},
		];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		rewindPhase("1", "1", { reason: "No reason" });

		expect(process.exitCode).toBe(1);
		expect(mockSetCurrentPhase).not.toHaveBeenCalled();
		expect(mockSetStatus).not.toHaveBeenCalled();
	});

	it("should reject if target phase is beyond current", () => {
		const items = [
			{
				id: 1,
				status: "in-progress",
				currentPhase: 1,
				plan: [
					{ name: "Phase 0", tasks: [] },
					{ name: "Phase 1", tasks: [] },
					{ name: "Phase 2", tasks: [] },
				],
			},
		];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		rewindPhase("1", "2", { reason: "No reason" });

		expect(process.exitCode).toBe(1);
		expect(mockSetCurrentPhase).not.toHaveBeenCalled();
	});

	it("should reject if item has no plan", () => {
		const items = [{ id: 1, status: "in-progress", currentPhase: 0 }];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		rewindPhase("1", "0", { reason: "No reason" });

		expect(process.exitCode).toBe(1);
		expect(mockSetCurrentPhase).not.toHaveBeenCalled();
	});

	it("should reject if phase index is out of range", () => {
		const items = [
			{
				id: 1,
				status: "in-progress",
				currentPhase: 2,
				plan: [
					{ name: "Phase 0", tasks: [] },
					{ name: "Phase 1", tasks: [] },
					{ name: "Phase 2", tasks: [] },
				],
			},
		];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		rewindPhase("1", "-1", { reason: "No reason" });

		expect(process.exitCode).toBe(1);
		expect(mockSetCurrentPhase).not.toHaveBeenCalled();
	});

	it("should set done items to in-progress", () => {
		const items = [
			{
				id: 1,
				status: "done",
				currentPhase: 3,
				plan: [
					{ name: "Phase 0", tasks: [] },
					{ name: "Phase 1", tasks: [] },
					{ name: "Phase 2", tasks: [] },
				],
			},
		];
		mockLoadAndFindItem.mockReturnValue({ items, item: items[0] });

		rewindPhase("1", "1", { reason: "Reopening" });

		expect(mockSetStatus).toHaveBeenCalledWith("1", "in-progress");
		expect(mockSetCurrentPhase).toHaveBeenCalledWith("1", 1);
	});

	it("should do nothing if item is not found", () => {
		mockLoadAndFindItem.mockReturnValue(undefined);

		rewindPhase("99", "0", { reason: "No reason" });

		expect(mockSetCurrentPhase).not.toHaveBeenCalled();
		expect(mockSetStatus).not.toHaveBeenCalled();
	});
});
