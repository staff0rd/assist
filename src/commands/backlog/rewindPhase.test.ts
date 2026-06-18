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
	setStatus: vi.fn(),
}));

vi.mock("./loadItem", () => ({
	loadItem: vi.fn(),
}));

vi.mock("./appendComment", () => ({
	appendComment: vi.fn(),
}));

vi.mock("./writeSignal", () => ({
	writeSignal: vi.fn(),
}));

import { appendComment } from "./appendComment";
import { loadItem } from "./loadItem";
import { rewindPhase } from "./rewindPhase";
import { getReady, setCurrentPhase, setStatus } from "./shared";
import { writeSignal } from "./writeSignal";

const mockGetReady = getReady as unknown as MockInstance;
const mockLoadItem = loadItem as unknown as MockInstance;
const mockSetCurrentPhase = setCurrentPhase as unknown as MockInstance;
const mockSetStatus = setStatus as unknown as MockInstance;
const mockAppendComment = appendComment as unknown as MockInstance;
const mockWriteSignal = writeSignal as unknown as MockInstance;

const orm = {} as never;

const threePhasePlan = [
	{ name: "Setup", tasks: [] },
	{ name: "Implement", tasks: [] },
	{ name: "Polish", tasks: [] },
];

describe("rewindPhase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetReady.mockResolvedValue({ orm });
		process.exitCode = undefined;
	});

	it("should rewind currentPhase and set status to in-progress", async () => {
		mockLoadItem.mockResolvedValue({
			id: 1,
			status: "in-progress",
			currentPhase: 3,
			plan: threePhasePlan,
		});

		await rewindPhase("1", "2", { reason: "Need to redo" });

		expect(mockSetCurrentPhase).toHaveBeenCalledWith("1", 2);
		expect(mockSetStatus).toHaveBeenCalledWith("1", "in-progress");
	});

	it("should write a rewind signal to terminate the session", async () => {
		mockLoadItem.mockResolvedValue({
			id: 1,
			status: "in-progress",
			currentPhase: 3,
			plan: threePhasePlan,
		});

		await rewindPhase("1", "2", { reason: "Need to redo" });

		expect(mockWriteSignal).toHaveBeenCalledWith("rewind", {
			itemId: 1,
			targetPhase: 1,
		});
	});

	it("should append a comment recording the rewind", async () => {
		mockLoadItem.mockResolvedValue({
			id: 1,
			status: "in-progress",
			currentPhase: 3,
			plan: threePhasePlan,
		});

		await rewindPhase("1", "1", { reason: "Tests failed" });

		expect(mockAppendComment).toHaveBeenCalledWith(
			orm,
			1,
			"Rewound to phase 1 (Setup): Tests failed",
			{ phase: 1 },
		);
	});

	it("should reject if target phase is not earlier than current", async () => {
		mockLoadItem.mockResolvedValue({
			id: 1,
			status: "in-progress",
			currentPhase: 2,
			plan: threePhasePlan,
		});

		await rewindPhase("1", "2", { reason: "No reason" });

		expect(process.exitCode).toBe(1);
		expect(mockSetCurrentPhase).not.toHaveBeenCalled();
		expect(mockSetStatus).not.toHaveBeenCalled();
	});

	it("should reject if target phase is beyond current", async () => {
		mockLoadItem.mockResolvedValue({
			id: 1,
			status: "in-progress",
			currentPhase: 2,
			plan: threePhasePlan,
		});

		await rewindPhase("1", "3", { reason: "No reason" });

		expect(process.exitCode).toBe(1);
		expect(mockSetCurrentPhase).not.toHaveBeenCalled();
	});

	it("should rewind a plan-less item that has advanced past phase 1", async () => {
		mockLoadItem.mockResolvedValue({
			id: 1,
			type: "bug",
			status: "in-progress",
			currentPhase: 2,
			acceptanceCriteria: ["Fix the thing"],
		});

		await rewindPhase("1", "1", { reason: "initial fix was nonsense" });

		expect(mockSetCurrentPhase).toHaveBeenCalledWith("1", 1);
		expect(mockSetStatus).toHaveBeenCalledWith("1", "in-progress");
		expect(mockAppendComment).toHaveBeenCalledWith(
			orm,
			1,
			"Rewound to phase 1 (Implement): initial fix was nonsense",
			{ phase: 1 },
		);
	});

	it("should reject a plan-less item when target is not earlier than current", async () => {
		mockLoadItem.mockResolvedValue({
			id: 1,
			type: "bug",
			status: "in-progress",
			currentPhase: 1,
			acceptanceCriteria: ["Fix the thing"],
		});

		await rewindPhase("1", "1", { reason: "No reason" });

		expect(process.exitCode).toBe(1);
		expect(mockSetCurrentPhase).not.toHaveBeenCalled();
	});

	it("should reject if phase number is out of range", async () => {
		mockLoadItem.mockResolvedValue({
			id: 1,
			status: "in-progress",
			currentPhase: 3,
			plan: threePhasePlan,
		});

		await rewindPhase("1", "0", { reason: "No reason" });

		expect(process.exitCode).toBe(1);
		expect(mockSetCurrentPhase).not.toHaveBeenCalled();
	});

	it("should set done items to in-progress", async () => {
		mockLoadItem.mockResolvedValue({
			id: 1,
			status: "done",
			currentPhase: 4,
			plan: threePhasePlan,
		});

		await rewindPhase("1", "2", { reason: "Reopening" });

		expect(mockSetStatus).toHaveBeenCalledWith("1", "in-progress");
		expect(mockSetCurrentPhase).toHaveBeenCalledWith("1", 2);
	});

	it("should do nothing if item is not found", async () => {
		mockLoadItem.mockResolvedValue(undefined);

		await rewindPhase("99", "1", { reason: "No reason" });

		expect(mockSetCurrentPhase).not.toHaveBeenCalled();
		expect(mockSetStatus).not.toHaveBeenCalled();
	});
});
