import { beforeEach, describe, expect, it, vi } from "vitest";
import { highLevelGlobsFeature } from "../../../shared/harnessAdapters/reviewFeatures";
import type * as runOneShotPromptModule from "../../../shared/runOneShotPrompt";
import {
	OneShotUnavailableError,
	runOneShotPrompt,
} from "../../../shared/runOneShotPrompt";
import { proposeHighLevelGlobs } from "./proposeHighLevelGlobs";

const state = vi.hoisted(() => ({ harness: "codex" }));

vi.mock("../../../shared/runOneShotPrompt", async (importOriginal) => ({
	...(await importOriginal<typeof runOneShotPromptModule>()),
	resolveOneShotHarness: () => state.harness,
	runOneShotPrompt: vi.fn(),
}));
vi.mock("./summariseRepoTree", () => ({
	summariseRepoTree: () => "src/\n  ui/\n",
}));

const answer = JSON.stringify({
	criticalPaths: ["src/db/**"],
	uiPaths: ["src/ui/**"],
});

describe("proposeHighLevelGlobs", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	it("asks the resolved harness through the headless one-shot contract", async () => {
		vi.mocked(runOneShotPrompt).mockResolvedValue(answer);

		const proposed = await proposeHighLevelGlobs("/repo");

		expect(runOneShotPrompt).toHaveBeenCalledWith(
			expect.stringContaining("src/\n  ui/"),
			highLevelGlobsFeature,
			{ harness: "codex", timeout: 120_000, effort: "medium", cwd: "/repo" },
		);
		expect(proposed.uiPaths).toEqual(["src/ui/**"]);
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining("Asking Codex to propose globs"),
		);
	});

	it("proposes nothing and prints the reason when the harness cannot one-shot", async () => {
		state.harness = "pi";
		vi.mocked(runOneShotPrompt).mockRejectedValue(
			new OneShotUnavailableError(
				"High-level review glob proposals is unavailable on pi",
			),
		);

		const proposed = await proposeHighLevelGlobs("/repo");

		expect(proposed).toEqual({ criticalPaths: [], uiPaths: [] });
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining("unavailable on pi"),
		);
		state.harness = "codex";
	});

	it("proposes nothing when the harness fails", async () => {
		vi.mocked(runOneShotPrompt).mockRejectedValue(new Error("timeout"));

		expect(await proposeHighLevelGlobs("/repo")).toEqual({
			criticalPaths: [],
			uiPaths: [],
		});
	});
});
