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

import { emitActivity } from "../../shared/emitActivity";
import { spawnClaude } from "../../shared/spawnClaude";
import { executePhase } from "./executePhase";

const mockEmitActivity = emitActivity as unknown as MockInstance;
const mockSpawnClaude = spawnClaude as unknown as MockInstance;

function makeItem(): BacklogItem {
	return {
		id: 7,
		type: "story",
		name: "Test item",
		acceptanceCriteria: ["AC1"],
		status: "in-progress",
	};
}

const phases: PlanPhase[] = [{ name: "Phase 1", tasks: [{ task: "do it" }] }];

describe("executePhase", () => {
	beforeEach(() => {
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
});
