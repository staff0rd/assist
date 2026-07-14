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
	setStatus: vi.fn(),
}));

vi.mock("./prepareRun", () => ({
	prepareRun: vi.fn(),
}));

vi.mock("./ensureStoryBranch", () => ({
	ensureStoryBranch: vi.fn(),
}));

vi.mock("./reloadPlan", () => ({
	reloadPlan: vi.fn(),
}));

vi.mock("./consumePause", () => ({
	consumePause: vi.fn(() => false),
	isPausePending: vi.fn(() => false),
	clearPause: vi.fn(),
}));

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

vi.mock("./acquireLock", () => ({
	acquireLock: vi.fn(),
	releaseLock: vi.fn(),
}));

import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { acquireLock, releaseLock } from "./acquireLock";
import { clearPause, consumePause, isPausePending } from "./consumePause";
import { executePhase } from "./executePhase";
import { prepareRun } from "./prepareRun";
import { reloadPlan } from "./reloadPlan";
import { run } from "./run";
import { setStatus } from "./shared";

const mockExecutePhase = executePhase as unknown as MockInstance;
const mockPrepareRun = prepareRun as unknown as MockInstance;
const mockReloadPlan = reloadPlan as unknown as MockInstance;
const mockSetStatus = setStatus as unknown as MockInstance;
const mockAcquireLock = acquireLock as unknown as MockInstance;
const mockReleaseLock = releaseLock as unknown as MockInstance;
const mockConsumePause = consumePause as unknown as MockInstance;
const mockIsPausePending = isPausePending as unknown as MockInstance;
const mockClearPause = clearPause as unknown as MockInstance;
const mockAppendDaemonLog = appendDaemonLog as unknown as MockInstance;

function makeItem(overrides: Partial<BacklogItem> = {}): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "Test item",
		acceptanceCriteria: ["AC1", "AC2"],
		status: "todo",
		starred: false,
		plan: [
			{ name: "Phase 1", tasks: [{ task: "Do something" }] },
			{ name: "Phase 2", tasks: [{ task: "Do more" }] },
		],
		...overrides,
	};
}

function makePlan(item: BacklogItem): PlanPhase[] {
	return item.plan ?? [];
}

const advance = { kind: "advance" as const };
const abort = { kind: "abort" as const };
const skip = { kind: "skip" as const };
const retry = { kind: "retry" as const };
function rewind(targetPhase: number) {
	return { kind: "rewind" as const, targetPhase };
}

describe("run", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockReloadPlan.mockReset();
	});

	describe("when prepare returns undefined", () => {
		it("should return without executing any phases", async () => {
			mockPrepareRun.mockReturnValue(undefined);

			await run("99");

			expect(mockExecutePhase).not.toHaveBeenCalled();
			expect(mockSetStatus).not.toHaveBeenCalled();
		});
	});

	describe("when authored phases complete and review succeeds", () => {
		it("should execute all authored phases then the review phase", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance) // phase 0 -> 1
				.mockResolvedValueOnce(advance) // phase 1 -> 2
				.mockResolvedValueOnce(advance); // review -> 3

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(3);
		});

		it("should pass the review phase as the last element", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance);

			await run("1");

			const reviewCall = mockExecutePhase.mock.calls[2];
			const phases: PlanPhase[] = reviewCall[2];
			expect(phases[phases.length - 1].name).toBe("Review");
		});

		it("should ensure item is marked done after review completes", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance);

			await run("1");

			expect(mockSetStatus).toHaveBeenCalledWith("1", "done");
		});

		it("should not fail if setStatus throws when marking done", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance);
			mockSetStatus
				.mockImplementationOnce(() => {}) // in-progress succeeds
				.mockImplementationOnce(() => {
					throw new Error("file conflict");
				}); // done throws

			await expect(run("1")).resolves.toBe(true);
		});
	});

	describe("when an authored phase fails", () => {
		it("should not run the review phase", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase.mockResolvedValueOnce(abort);

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(1);
		});

		it("should not mark done", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase.mockResolvedValueOnce(abort);

			await run("1");

			expect(mockSetStatus).toHaveBeenCalledWith("1", "in-progress");
			expect(mockSetStatus).not.toHaveBeenCalledWith("1", "done");
		});
	});

	describe("when the review phase fails", () => {
		it("should not mark done", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(abort); // review fails

			await run("1");

			expect(mockSetStatus).toHaveBeenCalledWith("1", "in-progress");
			expect(mockSetStatus).not.toHaveBeenCalledWith("1", "done");
		});
	});

	describe("when the review phase rewinds", () => {
		it("should resume execution from the rewound phase instead of finishing", async () => {
			const item = makeItem(); // [Phase 1, Phase 2]
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockReloadPlan.mockResolvedValue(makePlan(item));
			mockExecutePhase
				.mockResolvedValueOnce(advance) // phase 0 -> 1
				.mockResolvedValueOnce(advance) // phase 1 -> 2
				.mockResolvedValueOnce(rewind(0)) // review rewinds to phase 0
				.mockResolvedValueOnce(advance) // phase 0 re-runs -> 1
				.mockResolvedValueOnce(advance) // phase 1 re-runs -> 2
				.mockResolvedValueOnce(advance); // review -> 3 (done)

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(6);
			expect(mockExecutePhase.mock.calls[3][1]).toBe(0);
		});

		it("should mark done once a resumed run completes review cleanly", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockReloadPlan.mockResolvedValue(makePlan(item));
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(rewind(0)) // review rewinds
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance); // review passes

			await run("1");

			expect(mockSetStatus).toHaveBeenCalledWith("1", "done");
		});

		it("should not mark done if a resumed phase fails", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockReloadPlan.mockResolvedValue(makePlan(item));
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(rewind(0)) // review rewinds
				.mockResolvedValueOnce(abort); // resumed phase fails

			await expect(run("1")).resolves.toBe(false);

			expect(mockSetStatus).not.toHaveBeenCalledWith("1", "done");
		});
	});

	describe("when the review phase exits without a completion signal", () => {
		it("leaves the item in-progress and does not mark it done", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockReloadPlan.mockResolvedValue(makePlan(item));
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(skip);

			await run("1");

			expect(mockSetStatus).toHaveBeenCalledWith("1", "in-progress");
			expect(mockSetStatus).not.toHaveBeenCalledWith("1", "done");
		});

		it("resolves false so an auto-chain does not advance to the next item", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockReloadPlan.mockResolvedValue(makePlan(item));
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(skip);

			await expect(run("1")).resolves.toBe(false);
		});
	});

	describe("when Retry is chosen at the incomplete review prompt", () => {
		it("re-runs the review phase without completing the item", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockReloadPlan.mockResolvedValue(makePlan(item));
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(retry)
				.mockResolvedValueOnce(skip);

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(4);
			expect(mockExecutePhase.mock.calls[2][1]).toBe(2);
			expect(mockExecutePhase.mock.calls[3][1]).toBe(2);
			expect(mockSetStatus).not.toHaveBeenCalledWith("1", "done");
		});

		it("completes the item only once the re-run review passes", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockReloadPlan.mockResolvedValue(makePlan(item));
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(retry)
				.mockResolvedValueOnce(advance);

			await run("1");

			expect(mockSetStatus).toHaveBeenCalledWith("1", "done");
		});
	});

	describe("when resuming from a mid-plan phase", () => {
		it("should skip completed phases", async () => {
			const item = makeItem({ currentPhase: 2 });
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 1,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance) // phase 1 -> 2
				.mockResolvedValueOnce(advance); // review -> 3

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(2);
			expect(mockExecutePhase.mock.calls[0][1]).toBe(1);
		});
	});

	describe("when resuming at the review phase", () => {
		it("should run only the review phase", async () => {
			const item = makeItem({ currentPhase: 3 });
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 2,
			});
			mockExecutePhase.mockResolvedValueOnce(advance);

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(1);
			const reviewCall = mockExecutePhase.mock.calls[0];
			const phases: PlanPhase[] = reviewCall[2];
			expect(phases[phases.length - 1].name).toBe("Review");
		});

		it("counts the review phase in the resume progress line", async () => {
			const item = makeItem({
				plan: [{ name: "Phase 1", tasks: [{ task: "t1" }] }],
				currentPhase: 2,
			});
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 1,
			});
			mockExecutePhase.mockResolvedValueOnce(advance);
			const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			await run("1");

			const logged = logSpy.mock.calls.map((c) => String(c[0])).join("\n");
			expect(logged).toContain("Resuming from phase 2/2");
			logSpy.mockRestore();
		});
	});

	describe("when item has no plan", () => {
		it("should synthesize a plan from acceptance criteria", async () => {
			const item = makeItem({ plan: undefined });
			const synthesizedPlan: PlanPhase[] = [
				{
					name: "Implement",
					tasks: [{ task: "AC1" }, { task: "AC2" }],
				},
			];
			mockPrepareRun.mockReturnValue({
				item,
				plan: synthesizedPlan,
				startPhase: 0,
			});
			mockReloadPlan.mockResolvedValue(synthesizedPlan);
			mockExecutePhase
				.mockResolvedValueOnce(advance) // synthesized phase
				.mockResolvedValueOnce(advance); // review

			await run("1");

			const firstCall = mockExecutePhase.mock.calls[0];
			const phases: PlanPhase[] = firstCall[2];
			expect(phases[0].name).toBe("Implement");
			expect(phases[0].tasks).toEqual([{ task: "AC1" }, { task: "AC2" }]);
		});
	});

	describe("when phases are added mid-run", () => {
		it("runs a phase appended while the last authored phase executes", async () => {
			const item = makeItem(); // [Phase 1, Phase 2]
			const extended: PlanPhase[] = [
				...makePlan(item),
				{ name: "Phase 3", tasks: [{ task: "Added mid-run" }] },
			];
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance) // phase 0 -> 1
				.mockResolvedValueOnce(advance) // phase 1 -> 2 (Phase 3 appended here)
				.mockResolvedValueOnce(advance) // phase 2 (new) -> 3
				.mockResolvedValueOnce(advance); // review -> 4
			mockReloadPlan
				.mockResolvedValueOnce(makePlan(item)) // after phase 0: unchanged
				.mockResolvedValueOnce(extended) // after phase 1: Phase 3 appended
				.mockResolvedValueOnce(extended) // after phase 2
				.mockResolvedValueOnce(extended); // runReview

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(4);
			// The newly added phase (index 2) runs before review.
			expect(mockExecutePhase.mock.calls[2][1]).toBe(2);
		});

		it("runs the review phase only after all phases including added ones", async () => {
			const item = makeItem();
			const extended: PlanPhase[] = [
				...makePlan(item),
				{ name: "Phase 3", tasks: [{ task: "Added mid-run" }] },
			];
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance);
			mockReloadPlan
				.mockResolvedValueOnce(makePlan(item))
				.mockResolvedValueOnce(extended)
				.mockResolvedValueOnce(extended)
				.mockResolvedValueOnce(extended);

			await run("1");

			const reviewCall = mockExecutePhase.mock.calls[3];
			expect(reviewCall[1]).toBe(3); // review sits after all 3 authored phases
			const phases: PlanPhase[] = reviewCall[2];
			expect(phases).toHaveLength(4);
			expect(phases[phases.length - 1].name).toBe("Review");
		});

		it("runs a phase inserted ahead of the current phase without skipping it", async () => {
			const item = makeItem({
				plan: [
					{ name: "Phase 1", tasks: [{ task: "t1" }] },
					{ name: "Phase 2", tasks: [{ task: "t2" }] },
				],
			});
			// While Phase 1 executes, a phase is inserted ahead at index 1.
			const withInserted: PlanPhase[] = [
				{ name: "Phase 1", tasks: [{ task: "t1" }] },
				{ name: "Inserted", tasks: [{ task: "tX" }] },
				{ name: "Phase 2", tasks: [{ task: "t2" }] },
			];
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance) // phase 0 (Phase 1) -> 1
				.mockResolvedValueOnce(advance) // phase 1 (Inserted) -> 2
				.mockResolvedValueOnce(advance) // phase 2 (Phase 2) -> 3
				.mockResolvedValueOnce(advance); // review -> 4
			mockReloadPlan
				.mockResolvedValueOnce(withInserted) // after phase 0: Inserted appears
				.mockResolvedValueOnce(withInserted)
				.mockResolvedValueOnce(withInserted)
				.mockResolvedValueOnce(withInserted);

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(4);
			// Inserted phase (index 1) runs; original Phase 2 shifts to index 2.
			expect(mockExecutePhase.mock.calls[1][2][1].name).toBe("Inserted");
			expect(mockExecutePhase.mock.calls[2][2][2].name).toBe("Phase 2");
		});
	});

	describe("when resuming an interrupted Claude session after a restart", () => {
		it("resumes only the interrupted authored phase, not the review phase", async () => {
			const item = makeItem({ currentPhase: 2 });
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 1,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance);

			await run("1", { resumeSessionId: "sess-1" });

			expect(mockExecutePhase.mock.calls[0][3]).toEqual({
				resumeSessionId: "sess-1",
			});
			expect(mockExecutePhase.mock.calls[1][3]).toEqual({});
		});

		it("does not resume the review phase when an authored phase was interrupted", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance);

			await run("1", { resumeSessionId: "sess-1" });

			expect(mockExecutePhase.mock.calls[2][3]).toEqual({});
		});

		it("resumes the review phase when the restart interrupted it", async () => {
			const item = makeItem({ currentPhase: 3 });
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 2,
			});
			mockExecutePhase.mockResolvedValueOnce(advance);

			await run("1", { resumeSessionId: "sess-1" });

			expect(mockExecutePhase).toHaveBeenCalledTimes(1);
			expect(mockExecutePhase.mock.calls[0][3]).toEqual({
				resumeSessionId: "sess-1",
			});
		});

		it("does not resume a rewound phase", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockReloadPlan.mockResolvedValue(makePlan(item));
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(rewind(0))
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance);

			await run("1", { resumeSessionId: "sess-1" });

			expect(mockExecutePhase.mock.calls[0][3]).toEqual({
				resumeSessionId: "sess-1",
			});
			expect(mockExecutePhase.mock.calls[3][3]).toEqual({});
		});
	});

	describe("when auto-advance is turned off mid-phase", () => {
		it("stops after the current phase without starting the next", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase.mockResolvedValueOnce(advance);
			mockConsumePause.mockReturnValueOnce(true);

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(1);
		});

		it("does not run the review phase", async () => {
			const item = makeItem({
				plan: [{ name: "Phase 1", tasks: [{ task: "t1" }] }],
			});
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase.mockResolvedValueOnce(advance);
			mockConsumePause.mockReturnValueOnce(true);

			await run("1");

			expect(mockExecutePhase).toHaveBeenCalledTimes(1);
		});

		it("leaves the item in-progress without marking it done", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase.mockResolvedValueOnce(advance);
			mockConsumePause.mockReturnValueOnce(true);

			await run("1");

			expect(mockSetStatus).toHaveBeenCalledWith("1", "in-progress");
			expect(mockSetStatus).not.toHaveBeenCalledWith("1", "done");
		});

		it("exits cleanly (resolves true) so the process returns 0", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase.mockResolvedValueOnce(advance);
			mockConsumePause.mockReturnValueOnce(true);

			await expect(run("1")).resolves.toBe(true);
		});

		it("consumes the pause request once (one-shot)", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase.mockResolvedValueOnce(advance);
			mockConsumePause.mockReturnValueOnce(true);

			await run("1");

			expect(mockConsumePause).toHaveBeenCalledTimes(1);
			expect(mockConsumePause).toHaveBeenCalledWith(1);
		});
	});

	describe("stale pause file from an earlier run", () => {
		it("discards a pre-existing pause file at run start so the run auto-advances", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockIsPausePending.mockReturnValueOnce(true);
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance);

			await run("1");

			expect(mockClearPause).toHaveBeenCalledWith(1);
			expect(mockExecutePhase).toHaveBeenCalledTimes(3);
		});

		it("does not clear or log when no pause file is present", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockIsPausePending.mockReturnValue(false);
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance);

			await run("1");

			expect(mockClearPause).not.toHaveBeenCalled();
			expect(mockAppendDaemonLog).not.toHaveBeenCalled();
		});

		it("records the discard in the daemon log", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockIsPausePending.mockReturnValueOnce(true);
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance);

			await run("1");

			expect(mockAppendDaemonLog).toHaveBeenCalledTimes(1);
			expect(String(mockAppendDaemonLog.mock.calls[0][0])).toContain(
				"discarded stale pause file",
			);
		});
	});

	describe("pausing on a mid-run Continue-off toggle", () => {
		it("records the pause in the daemon log", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase.mockResolvedValueOnce(advance);
			mockConsumePause.mockReturnValueOnce(true);

			await run("1");

			expect(mockAppendDaemonLog).toHaveBeenCalledTimes(1);
			expect(String(mockAppendDaemonLog.mock.calls[0][0])).toContain(
				"paused before phase",
			);
		});
	});

	describe("lock lifecycle", () => {
		it("should acquire lock before phases and release after completion", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance);

			await run("1");

			expect(mockAcquireLock).toHaveBeenCalledWith(1);
			expect(mockReleaseLock).toHaveBeenCalledWith(1);
		});

		it("should release lock when an authored phase fails", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase.mockResolvedValueOnce(abort);

			await run("1");

			expect(mockAcquireLock).toHaveBeenCalledWith(1);
			expect(mockReleaseLock).toHaveBeenCalledWith(1);
		});

		it("should release lock when the review phase fails", async () => {
			const item = makeItem();
			mockPrepareRun.mockReturnValue({
				item,
				plan: makePlan(item),
				startPhase: 0,
			});
			mockExecutePhase
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(advance)
				.mockResolvedValueOnce(abort);

			await run("1");

			expect(mockAcquireLock).toHaveBeenCalledWith(1);
			expect(mockReleaseLock).toHaveBeenCalledWith(1);
		});

		it("should not acquire lock when prepare returns undefined", async () => {
			mockPrepareRun.mockReturnValue(undefined);

			await run("99");

			expect(mockAcquireLock).not.toHaveBeenCalled();
			expect(mockReleaseLock).not.toHaveBeenCalled();
		});
	});
});
