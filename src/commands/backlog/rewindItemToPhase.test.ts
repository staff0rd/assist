import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("./appendComment", () => ({
	appendComment: vi.fn(),
}));

vi.mock("./updateCurrentPhase", () => ({
	updateCurrentPhase: vi.fn(),
}));

vi.mock("./updateStatus", () => ({
	updateStatus: vi.fn(),
}));

vi.mock("./writeSignal", () => ({
	writeSignal: vi.fn(),
}));

import { appendComment } from "./appendComment";
import { rewindItemToPhase } from "./rewindItemToPhase";
import type { BacklogItem } from "./types";
import { updateCurrentPhase } from "./updateCurrentPhase";
import { updateStatus } from "./updateStatus";
import { writeSignal } from "./writeSignal";

const mockAppendComment = appendComment as unknown as MockInstance;
const mockUpdateCurrentPhase = updateCurrentPhase as unknown as MockInstance;
const mockUpdateStatus = updateStatus as unknown as MockInstance;
const mockWriteSignal = writeSignal as unknown as MockInstance;

const orm = {} as never;

const threePhasePlan = [
	{ name: "Setup", tasks: [] },
	{ name: "Implement", tasks: [] },
	{ name: "Polish", tasks: [] },
];

const item = (overrides: Partial<BacklogItem>): BacklogItem => ({
	id: 1,
	name: "Test item",
	acceptanceCriteria: [],
	starred: false,
	type: "story",
	status: "in-progress",
	...overrides,
});

describe("rewindItemToPhase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should move the item to the target phase as in-progress", async () => {
		const result = await rewindItemToPhase(
			orm,
			item({ currentPhase: 3, plan: threePhasePlan }),
			2,
			"Need to redo",
		);

		expect(result).toEqual({ ok: true, phaseName: "Implement" });
		expect(mockUpdateCurrentPhase).toHaveBeenCalledWith(orm, 1, 2);
		expect(mockUpdateStatus).toHaveBeenCalledWith(orm, 1, "in-progress");
	});

	it("should write a rewind signal targeting the zero-based phase index", async () => {
		await rewindItemToPhase(
			orm,
			item({ currentPhase: 3, plan: threePhasePlan }),
			2,
			"Need to redo",
		);

		expect(mockWriteSignal).toHaveBeenCalledWith("rewind", {
			itemId: 1,
			targetPhase: 1,
		});
	});

	it("should append a comment recording the rewind", async () => {
		await rewindItemToPhase(
			orm,
			item({ currentPhase: 3, plan: threePhasePlan }),
			1,
			"Tests failed",
		);

		expect(mockAppendComment).toHaveBeenCalledWith(
			orm,
			1,
			"Rewound to phase 1 (Setup): Tests failed",
			{ phase: 1 },
		);
	});

	it("should rewind a done story to the appended Review phase", async () => {
		const result = await rewindItemToPhase(
			orm,
			item({ status: "done", currentPhase: 5, plan: threePhasePlan }),
			4,
			"Reopening for review",
		);

		expect(result).toEqual({ ok: true, phaseName: "Review" });
		expect(mockUpdateCurrentPhase).toHaveBeenCalledWith(orm, 1, 4);
		expect(mockWriteSignal).toHaveBeenCalledWith("rewind", {
			itemId: 1,
			targetPhase: 3,
		});
	});

	it("should reject if target phase is not earlier than current", async () => {
		const result = await rewindItemToPhase(
			orm,
			item({ currentPhase: 2, plan: threePhasePlan }),
			2,
			"No reason",
		);

		expect(result.ok).toBe(false);
		expect(mockUpdateCurrentPhase).not.toHaveBeenCalled();
		expect(mockUpdateStatus).not.toHaveBeenCalled();
		expect(mockWriteSignal).not.toHaveBeenCalled();
	});

	it("should reject if phase number is out of range", async () => {
		const result = await rewindItemToPhase(
			orm,
			item({ currentPhase: 3, plan: threePhasePlan }),
			0,
			"No reason",
		);

		expect(result.ok).toBe(false);
		expect(mockUpdateCurrentPhase).not.toHaveBeenCalled();
	});

	it("should rewind a plan-less item that has advanced past phase 1", async () => {
		const result = await rewindItemToPhase(
			orm,
			item({
				type: "bug",
				currentPhase: 2,
				acceptanceCriteria: ["Fix the thing"],
			}),
			1,
			"initial fix was nonsense",
		);

		expect(result).toEqual({ ok: true, phaseName: "Implement" });
		expect(mockUpdateCurrentPhase).toHaveBeenCalledWith(orm, 1, 1);
		expect(mockUpdateStatus).toHaveBeenCalledWith(orm, 1, "in-progress");
		expect(mockAppendComment).toHaveBeenCalledWith(
			orm,
			1,
			"Rewound to phase 1 (Implement): initial fix was nonsense",
			{ phase: 1 },
		);
	});

	it("should reject a plan-less item when target is not earlier than current", async () => {
		const result = await rewindItemToPhase(
			orm,
			item({
				type: "bug",
				currentPhase: 1,
				acceptanceCriteria: ["Fix the thing"],
			}),
			1,
			"No reason",
		);

		expect(result.ok).toBe(false);
		expect(mockUpdateCurrentPhase).not.toHaveBeenCalled();
	});
});
