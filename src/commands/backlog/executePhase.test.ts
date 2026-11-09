import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type * as harnessAdapterModule from "../../shared/harnessAdapters/harnessAdapter";
import type { HarnessKind } from "../../shared/harnesses";
import { makeBacklogItem } from "../../test/mothers/makeBacklogItem";
import type { PlanPhase } from "./types";

vi.mock("node:crypto", () => ({
	randomUUID: vi.fn(() => "generated-uuid"),
}));

vi.mock("../../shared/emitActivity", () => ({
	emitActivity: vi.fn(),
}));

const launches = vi.hoisted(() => ({
	launchPrompt: vi.fn(),
	resume: vi.fn(),
}));

vi.mock(
	"../../shared/harnessAdapters/harnessAdapter",
	async (importOriginal) => {
		const actual = await importOriginal<typeof harnessAdapterModule>();
		return {
			harnessAdapter: (kind?: HarnessKind) => ({
				...actual.harnessAdapter(kind),
				launchPrompt: (...args: unknown[]) =>
					launches.launchPrompt(kind ?? "claude", ...args),
				resume: (...args: unknown[]) =>
					launches.resume(kind ?? "claude", ...args),
			}),
		};
	},
);

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
import { setSessionStatus } from "../sessions/setSessionStatus";
import { executePhase } from "./executePhase";
import { persistPhaseSession } from "./persistPhaseSession";
import { persistPhaseSessionId } from "./persistPhaseSessionId";
import { resolvePhaseResult } from "./resolvePhaseResult";
import { verifyResumeConversation } from "./verifyResumeConversation";

const mockEmitActivity = emitActivity as unknown as MockInstance;
const spawned = () => ({ child: {}, done: Promise.resolve(0) });
const cwd = process.cwd();
const mockSetSessionStatus = setSessionStatus as unknown as MockInstance;
const mockResolvePhaseResult = resolvePhaseResult as unknown as MockInstance;
const mockPersistPhaseSessionId =
	persistPhaseSessionId as unknown as MockInstance;
const mockPersistPhaseSession = persistPhaseSession as unknown as MockInstance;
const mockVerifyResumeConversation =
	verifyResumeConversation as unknown as MockInstance;

const phases: PlanPhase[] = [{ name: "Phase 1", tasks: [{ task: "do it" }] }];

describe("executePhase", () => {
	beforeEach(() => {
		delete process.env.ASSIST_RESUME_IDLE;
		delete process.env.ASSIST_RESUME_PROMPT;
		vi.clearAllMocks();
		launches.launchPrompt.mockImplementation(spawned);
		launches.resume.mockImplementation(spawned);
	});

	it("assigns a generated session id to a fresh phase and reports it", async () => {
		await executePhase(makeBacklogItem({ id: 7 }), 0, phases);

		expect(launches.launchPrompt).toHaveBeenCalledWith(
			"claude",
			"PHASE_PROMPT",
			{ cwd, allowEdits: undefined, conversationId: "generated-uuid" },
		);
		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining({ claudeSessionId: "generated-uuid" }),
		);
	});

	it("resumes the interrupted conversation and reports its id, not a new one", async () => {
		await executePhase(makeBacklogItem({ id: 7 }), 0, phases, {
			resumeSessionId: "sess-9",
		});

		expect(launches.resume).toHaveBeenCalledWith(
			"claude",
			"sess-9",
			"RESUME_PROMPT",
			{ cwd, allowEdits: undefined },
		);
		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining({ claudeSessionId: "sess-9" }),
		);
	});

	it("resumes a Codex conversation and reports it as the harness session", async () => {
		await executePhase(makeBacklogItem({ id: 7 }), 0, phases, {
			harness: "codex",
			resumeSessionId: "codex-9",
		});

		expect(mockVerifyResumeConversation).toHaveBeenCalledWith(
			7,
			"codex-9",
			"phase 1/1",
			"codex",
		);
		expect(launches.resume).toHaveBeenCalledWith(
			"codex",
			"codex-9",
			"RESUME_PROMPT",
			{ cwd, allowEdits: undefined },
		);
		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining({
				harness: "codex",
				harnessSessionId: "codex-9",
			}),
		);
	});

	it("records the phase->session mapping on a fresh launch", async () => {
		await executePhase(makeBacklogItem({ id: 7 }), 0, phases);

		expect(mockPersistPhaseSessionId).toHaveBeenCalledWith(
			7,
			0,
			"generated-uuid",
		);
	});

	it("launches a fresh phase with the selected harness", async () => {
		await executePhase(makeBacklogItem({ id: 7 }), 0, phases, {
			harness: "codex",
		});

		expect(launches.launchPrompt).toHaveBeenCalledWith(
			"codex",
			"PHASE_PROMPT",
			{ cwd, allowEdits: undefined, conversationId: "generated-uuid" },
		);
	});

	it("does not overwrite the phase->session mapping on resume", async () => {
		await executePhase(makeBacklogItem({ id: 7 }), 0, phases, {
			resumeSessionId: "sess-9",
		});

		expect(mockPersistPhaseSessionId).not.toHaveBeenCalled();
	});

	it("appends a session-history row on a fresh launch", async () => {
		await executePhase(makeBacklogItem({ id: 7 }), 0, phases);

		expect(mockPersistPhaseSession).toHaveBeenCalledWith(
			7,
			0,
			"generated-uuid",
		);
	});

	it("appends a session-history row on resume too", async () => {
		await executePhase(makeBacklogItem({ id: 7 }), 0, phases, {
			resumeSessionId: "sess-9",
		});

		expect(mockPersistPhaseSession).toHaveBeenCalledWith(7, 0, "sess-9");
	});

	it("reports the authored phase name as the activity phaseName", async () => {
		await executePhase(makeBacklogItem({ id: 7 }), 0, phases, undefined, 2);

		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining({ phaseName: "Phase 1" }),
		);
	});

	it("reports 'Review' for the phase beyond the authored plan", async () => {
		const reviewPhases: PlanPhase[] = [
			...phases,
			{ name: "Review", tasks: [{ task: "review it" }] },
		];

		await executePhase(
			makeBacklogItem({ id: 7 }),
			1,
			reviewPhases,
			undefined,
			2,
		);

		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining({ phase: 2, phaseName: "Review" }),
		);
	});

	describe("when the phase Claude has exited", () => {
		it("pushes running so the card reflects the driver's between-phase work", async () => {
			await executePhase(makeBacklogItem({ id: 7 }), 0, phases);

			expect(mockSetSessionStatus).toHaveBeenCalledWith("running");
		});
	});

	describe("when the phase Claude fails to launch", () => {
		it("does not push running for work that never starts", async () => {
			launches.launchPrompt.mockReturnValueOnce({
				child: {},
				done: Promise.reject(new Error("spawn failed")),
			});

			const result = await executePhase(makeBacklogItem({ id: 7 }), 0, phases);

			expect(result).toEqual({ kind: "abort" });
			expect(mockSetSessionStatus).not.toHaveBeenCalled();
		});
	});

	describe("when a restart-resume targets a missing conversation", () => {
		it("fails the phase without spawning Claude or resolving a result", async () => {
			mockVerifyResumeConversation.mockResolvedValueOnce(false);

			const result = await executePhase(makeBacklogItem({ id: 7 }), 0, phases, {
				resumeSessionId: "gone-9",
			});

			expect(result).toEqual({ kind: "abort" });
			expect(launches.launchPrompt).not.toHaveBeenCalled();
			expect(launches.resume).not.toHaveBeenCalled();
			expect(mockResolvePhaseResult).not.toHaveBeenCalled();
			expect(mockSetSessionStatus).not.toHaveBeenCalled();
		});
	});
});
