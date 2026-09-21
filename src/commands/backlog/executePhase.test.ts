import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type { BacklogItem, PlanPhase } from "./types";

vi.mock("node:crypto", () => ({
	randomUUID: vi.fn(() => "generated-uuid"),
}));

vi.mock("../../shared/emitActivity", () => ({
	emitActivity: vi.fn(),
}));

vi.mock("../../shared/spawnHarness", () => ({
	spawnHarness: vi.fn(() => ({ child: {}, done: Promise.resolve(0) })),
}));

vi.mock("./buildPhasePrompt", () => ({
	buildPhasePrompt: vi.fn(() => "PHASE_PROMPT"),
	REVIEW_PHASE_NAME: "Review",
}));

vi.mock("./buildResumePrompt", () => ({
	buildResumePrompt: vi.fn(() => "RESUME_PROMPT"),
}));

vi.mock("./resolvePhaseResult", () => ({
	resolvePhaseResult: vi.fn(() => ({ kind: "advance" })),
	cleanupSignal: vi.fn(),
}));

vi.mock("./verifyResumeConversation", () => ({
	verifyResumeConversation: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("./watchForMarker", () => ({
	watchForMarker: vi.fn(),
	stopWatching: vi.fn(),
}));

vi.mock("../sessions/setSessionStatus", () => ({
	setSessionStatus: vi.fn(),
}));

vi.mock("./persistPhaseSessionId", () => ({
	persistPhaseSessionId: vi.fn(),
}));

vi.mock("./persistPhaseSession", () => ({
	persistPhaseSession: vi.fn(),
}));

vi.mock("./recordSignalOwner", () => ({
	recordSignalOwner: vi.fn(),
}));

import { emitActivity } from "../../shared/emitActivity";
import { spawnHarness } from "../../shared/spawnHarness";
import { setSessionStatus } from "../sessions/setSessionStatus";
import { executePhase } from "./executePhase";
import { persistPhaseSession } from "./persistPhaseSession";
import { persistPhaseSessionId } from "./persistPhaseSessionId";
import { resolvePhaseResult } from "./resolvePhaseResult";
import { verifyResumeConversation } from "./verifyResumeConversation";

const mockEmitActivity = emitActivity as unknown as MockInstance;
const mockSpawnHarness = spawnHarness as unknown as MockInstance;
const mockSetSessionStatus = setSessionStatus as unknown as MockInstance;
const mockResolvePhaseResult = resolvePhaseResult as unknown as MockInstance;
const mockPersistPhaseSessionId =
	persistPhaseSessionId as unknown as MockInstance;
const mockPersistPhaseSession = persistPhaseSession as unknown as MockInstance;
const mockVerifyResumeConversation =
	verifyResumeConversation as unknown as MockInstance;

function makeItem(): BacklogItem {
	return {
		id: 7,
		type: "story",
		name: "Test item",
		acceptanceCriteria: ["AC1"],
		status: "in-progress",
		starred: false,
	};
}

const phases: PlanPhase[] = [{ name: "Phase 1", tasks: [{ task: "do it" }] }];

describe("executePhase", () => {
	beforeEach(() => {
		delete process.env.ASSIST_RESUME_IDLE;
		delete process.env.ASSIST_RESUME_PROMPT;
		vi.clearAllMocks();
	});

	it("assigns a generated session id to a fresh phase and reports it", async () => {
		await executePhase(makeItem(), 0, phases);

		expect(mockSpawnHarness).toHaveBeenCalledWith("claude", "PHASE_PROMPT", {
			sessionId: "generated-uuid",
			cwd: process.cwd(),
		});
		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining({ claudeSessionId: "generated-uuid" }),
		);
	});

	it("resumes the interrupted conversation and reports its id, not a new one", async () => {
		await executePhase(makeItem(), 0, phases, { resumeSessionId: "sess-9" });

		expect(mockSpawnHarness).toHaveBeenCalledWith("claude", "RESUME_PROMPT", {
			resumeSessionId: "sess-9",
			cwd: process.cwd(),
		});
		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining({ claudeSessionId: "sess-9" }),
		);
	});

	it("rejects Codex resume until conversation resume is supported", async () => {
		await expect(
			executePhase(makeItem(), 0, phases, {
				harness: "codex",
				resumeSessionId: "sess-9",
			}),
		).rejects.toThrow("Codex backlog sessions cannot be resumed yet");

		expect(mockSpawnHarness).not.toHaveBeenCalled();
	});

	it("records the phase->session mapping on a fresh launch", async () => {
		await executePhase(makeItem(), 0, phases);

		expect(mockPersistPhaseSessionId).toHaveBeenCalledWith(
			7,
			0,
			"generated-uuid",
		);
	});

	it("launches a fresh phase with the selected harness", async () => {
		await executePhase(makeItem(), 0, phases, { harness: "codex" });

		expect(mockSpawnHarness).toHaveBeenCalledWith("codex", "PHASE_PROMPT", {
			sessionId: "generated-uuid",
			cwd: process.cwd(),
		});
	});

	it("does not overwrite the phase->session mapping on resume", async () => {
		await executePhase(makeItem(), 0, phases, { resumeSessionId: "sess-9" });

		expect(mockPersistPhaseSessionId).not.toHaveBeenCalled();
	});

	it("appends a session-history row on a fresh launch", async () => {
		await executePhase(makeItem(), 0, phases);

		expect(mockPersistPhaseSession).toHaveBeenCalledWith(
			7,
			0,
			"generated-uuid",
		);
	});

	it("appends a session-history row on resume too", async () => {
		await executePhase(makeItem(), 0, phases, { resumeSessionId: "sess-9" });

		expect(mockPersistPhaseSession).toHaveBeenCalledWith(7, 0, "sess-9");
	});

	it("reports the authored phase name as the activity phaseName", async () => {
		await executePhase(makeItem(), 0, phases, undefined, 2);

		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining({ phaseName: "Phase 1" }),
		);
	});

	it("reports 'Review' for the phase beyond the authored plan", async () => {
		const reviewPhases: PlanPhase[] = [
			...phases,
			{ name: "Review", tasks: [{ task: "review it" }] },
		];

		await executePhase(makeItem(), 1, reviewPhases, undefined, 2);

		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining({ phase: 2, phaseName: "Review" }),
		);
	});

	describe("when the phase Claude has exited", () => {
		it("pushes running so the card reflects the driver's between-phase work", async () => {
			await executePhase(makeItem(), 0, phases);

			expect(mockSetSessionStatus).toHaveBeenCalledWith("running");
		});
	});

	describe("when the phase Claude fails to launch", () => {
		it("does not push running for work that never starts", async () => {
			mockSpawnHarness.mockReturnValueOnce({
				child: {},
				done: Promise.reject(new Error("spawn failed")),
			});

			const result = await executePhase(makeItem(), 0, phases);

			expect(result).toEqual({ kind: "abort" });
			expect(mockSetSessionStatus).not.toHaveBeenCalled();
		});
	});

	describe("when a restart-resume targets a missing conversation", () => {
		it("fails the phase without spawning Claude or resolving a result", async () => {
			mockVerifyResumeConversation.mockResolvedValueOnce(false);

			const result = await executePhase(makeItem(), 0, phases, {
				resumeSessionId: "gone-9",
			});

			expect(result).toEqual({ kind: "abort" });
			expect(mockSpawnHarness).not.toHaveBeenCalled();
			expect(mockResolvePhaseResult).not.toHaveBeenCalled();
			expect(mockSetSessionStatus).not.toHaveBeenCalled();
		});
	});
});
