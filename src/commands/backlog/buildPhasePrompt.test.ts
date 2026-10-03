import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../shared/loadConfig";
import {
	type AssistConfigInput,
	makeAssistConfig,
} from "../../test/mothers/makeAssistConfig";
import { makeBacklogItem } from "../../test/mothers/makeBacklogItem";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { buildPhasePrompt } from "./buildPhasePrompt";
import type { PlanPhase } from "./types";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const loadConfigMock = vi.mocked(loadConfig);

const phase: PlanPhase = { name: "Phase 1", tasks: [{ task: "do it" }] };

function mockWorktree(worktree: AssistConfigInput["worktree"]): void {
	loadConfigMock.mockReturnValue(makeAssistConfig({ worktree }));
}

const COMMIT_LINE =
	"Once verify passes, run /commit to commit the work before marking this phase as done.";

describe("buildPhasePrompt", () => {
	beforeEach(() => {
		loadConfigMock.mockReset();
	});

	it("adds no commit instruction when neither key is set", () => {
		mockWorktree({ enabled: true });

		expect(buildPhasePrompt(makeBacklogItem(), 1, phase)).not.toContain(
			"/commit",
		);
	});

	it("adds no commit instruction when there is no worktree config at all", () => {
		loadConfigMock.mockReturnValue(makeAssistConfig());

		expect(buildPhasePrompt(makeBacklogItem(), 1, phase)).not.toContain(
			"/commit",
		);
	});

	it("honours worktree.commitBeforePhaseEnd", () => {
		mockWorktree({ commitBeforePhaseEnd: true });

		expect(buildPhasePrompt(makeBacklogItem(), 1, phase)).toContain(
			COMMIT_LINE,
		);
	});

	it("falls back to worktree.commitBeforeManualChecks when the new key is unset", () => {
		mockWorktree({ commitBeforeManualChecks: true });

		expect(buildPhasePrompt(makeBacklogItem(), 1, phase)).toContain(
			COMMIT_LINE,
		);
	});

	it("lets the new key win when both are set", () => {
		mockWorktree({
			commitBeforePhaseEnd: false,
			commitBeforeManualChecks: true,
		});

		expect(buildPhasePrompt(makeBacklogItem(), 1, phase)).not.toContain(
			"/commit",
		);

		mockWorktree({
			commitBeforePhaseEnd: true,
			commitBeforeManualChecks: false,
		});

		expect(buildPhasePrompt(makeBacklogItem(), 1, phase)).toContain(
			COMMIT_LINE,
		);
	});
});
