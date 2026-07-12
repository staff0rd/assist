import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("../../shared/db/findPhaseBySessionId", () => ({
	findPhaseBySessionId: vi.fn(),
}));

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

vi.mock("./appendComment", () => ({
	appendComment: vi.fn(),
}));

vi.mock("./updateCurrentPhase", () => ({
	updateCurrentPhase: vi.fn(),
}));

import { findPhaseBySessionId } from "../../shared/db/findPhaseBySessionId";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { appendComment } from "./appendComment";
import { reconcileResumePhase } from "./reconcileResumePhase";
import type { BacklogItem } from "./types";
import { updateCurrentPhase } from "./updateCurrentPhase";

const mockFindPhase = findPhaseBySessionId as unknown as MockInstance;
const mockAppendDaemonLog = appendDaemonLog as unknown as MockInstance;
const mockAppendComment = appendComment as unknown as MockInstance;
const mockUpdateCurrentPhase = updateCurrentPhase as unknown as MockInstance;

const orm = {} as never;

const item = (overrides: Partial<BacklogItem> = {}): BacklogItem => ({
	id: 7,
	name: "Test item",
	acceptanceCriteria: [],
	starred: false,
	type: "story",
	status: "in-progress",
	...overrides,
});

describe("reconcileResumePhase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the DB start phase unchanged when not resuming", async () => {
		const result = await reconcileResumePhase(orm, item(), 1, undefined);

		expect(result).toBe(1);
		expect(mockFindPhase).not.toHaveBeenCalled();
		expect(mockUpdateCurrentPhase).not.toHaveBeenCalled();
	});

	it("returns the DB start phase unchanged when the session is unknown", async () => {
		mockFindPhase.mockResolvedValue(undefined);

		const result = await reconcileResumePhase(orm, item(), 1, "sess-abc");

		expect(result).toBe(1);
		expect(mockUpdateCurrentPhase).not.toHaveBeenCalled();
		expect(mockAppendDaemonLog).not.toHaveBeenCalled();
	});

	it("returns the DB start phase unchanged when session matches the phase", async () => {
		mockFindPhase.mockResolvedValue(1);

		const result = await reconcileResumePhase(orm, item(), 1, "sess-abc");

		expect(result).toBe(1);
		expect(mockUpdateCurrentPhase).not.toHaveBeenCalled();
		expect(mockAppendComment).not.toHaveBeenCalled();
	});

	it("corrects the start phase to match the resumed conversation on divergence", async () => {
		mockFindPhase.mockResolvedValue(2);

		const result = await reconcileResumePhase(
			orm,
			item({ currentPhase: 2 }),
			1,
			"f4f18318",
		);

		expect(result).toBe(2);
		expect(mockUpdateCurrentPhase).toHaveBeenCalledWith(orm, 7, 3);
	});

	it("leaves an audit trail (daemon log + comment) on divergence", async () => {
		mockFindPhase.mockResolvedValue(2);

		await reconcileResumePhase(orm, item({ currentPhase: 2 }), 1, "f4f18318");

		expect(mockAppendDaemonLog).toHaveBeenCalledTimes(1);
		expect(mockAppendDaemonLog.mock.calls[0][0]).toContain("f4f18318");
		expect(mockAppendComment).toHaveBeenCalledTimes(1);
		expect(mockAppendComment.mock.calls[0][1]).toBe(7);
		expect(mockAppendComment.mock.calls[0][3]).toEqual({ phase: 3 });
	});
});
