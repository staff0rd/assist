import { describe, expect, it } from "vitest";
import type { FeatureResolution } from "../../../../../shared/harnessAdapters/types";
import type { HarnessCapabilities } from "../useHarnessCapabilities";
import { reviewModeEntries } from "./reviewModeEntries";

const available: FeatureResolution = { available: true };
const unavailable: FeatureResolution = {
	available: false,
	reasons: [
		{ capability: "harness.detected", reason: "missing", remediation: "x" },
	],
};

function capabilities(
	features: HarnessCapabilities["features"],
): HarnessCapabilities {
	return {
		exposeCodexActions: true,
		exposePiActions: true,
		engine: "claude",
		features,
	};
}

describe("reviewModeEntries", () => {
	it("lists only the base modes when no other harness resolves available", () => {
		const labels = reviewModeEntries(capabilities({})).map((e) => e.label);

		expect(labels).toEqual([
			"Review",
			"Review & refine",
			"Review & apply",
			"Review & post",
			"High-level review",
		]);
	});

	it("adds a 'with <harness>' entry per feature where the resolver allows it", () => {
		const entries = reviewModeEntries(
			capabilities({
				reviewRefine: { claude: available, codex: available, pi: unavailable },
				reviewApply: { claude: available, codex: unavailable, pi: available },
				highLevelReview: { claude: available, codex: available },
			}),
		);

		expect(entries.filter((e) => e.onHarness)).toEqual([
			{
				label: "Review & refine with Codex",
				args: ["review", "--refine", "--harness", "codex"],
				onHarness: true,
			},
			{
				label: "Review & apply with pi",
				args: ["review", "--apply", "--harness", "pi"],
				onHarness: true,
			},
			{
				label: "High-level review with Codex",
				args: ["review", "--high-level", "--harness", "codex"],
				onHarness: true,
			},
		]);
	});

	it("offers Claude when the node's engine is another harness", () => {
		const entries = reviewModeEntries({
			...capabilities({
				reviewRefine: { claude: available, codex: available },
			}),
			engine: "codex",
		});

		expect(entries.map((e) => e.label)).toContain(
			"Review & refine with Claude",
		);
		expect(entries.map((e) => e.label)).not.toContain(
			"Review & refine with Codex",
		);
	});
});
