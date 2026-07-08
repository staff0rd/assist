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

vi.mock("../../shared/spawnClaude", () => ({
	spawnClaude: vi.fn(() => ({ child: {}, done: Promise.resolve(0) })),
}));

vi.mock("./buildPhasePrompt", () => ({
	buildPhasePrompt: vi.fn(() => "PHASE_PROMPT"),
	REVIEW_PHASE_NAME: "Review",
}));

vi.mock("./buildResumePrompt", () => ({
	buildResumePrompt: vi.fn(() => "RESUME_PROMPT"),
}));

vi.mock("./resolvePhaseResult", () => ({
	resolvePhaseResult: vi.fn(() => 1),
}));

vi.mock("./watchForMarker", () => ({
	watchForMarker: vi.fn(),
	stopWatching: vi.fn(),
}));

vi.mock("../sessions/setSessionStatus", () => ({
	setSessionStatus: vi.fn(),
}));

import { emitActivity } from "../../shared/emitActivity";
import { spawnClaude } from "../../shared/spawnClaude";
import { setSessionStatus } from "../sessions/setSessionStatus";
import { executePhase } from "./executePhase";

const mockEmitActivity = emitActivity as unknown as MockInstance;
const mockSpawnClaude = spawnClaude as unknown as MockInstance;
const mockSetSessionStatus = setSessionStatus as unknown as MockInstance;

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
		vi.clearAllMocks();
	});

	it("assigns a generated session id to a fresh phase and reports it", async () => {
		await executePhase(makeItem(), 0, phases);

		expect(mockSpawnClaude).toHaveBeenCalledWith("PHASE_PROMPT", {
			sessionId: "generated-uuid",
		});
		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining({ claudeSessionId: "generated-uuid" }),
		);
	});

	it("resumes the interrupted conversation and reports its id, not a new one", async () => {
		await executePhase(makeItem(), 0, phases, { resumeSessionId: "sess-9" });

		expect(mockSpawnClaude).toHaveBeenCalledWith("RESUME_PROMPT", {
			resumeSessionId: "sess-9",
		});
		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining({ claudeSessionId: "sess-9" }),
		);
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
			mockSpawnClaude.mockReturnValueOnce({
				child: {},
				done: Promise.reject(new Error("spawn failed")),
			});

			const result = await executePhase(makeItem(), 0, phases);

			expect(result).toBe(-1);
			expect(mockSetSessionStatus).not.toHaveBeenCalled();
		});
	});
});
