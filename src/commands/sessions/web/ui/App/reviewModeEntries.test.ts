import { describe, expect, it } from "vitest";
import type { FeatureResolution } from "../../../../../shared/harnessAdapters/types";
import type { HarnessCapabilities } from "../useHarnessCapabilities";
import { isAllowedPrArgs } from "../../../../../shared/isAllowedPrArgs";
import { prActions } from "../../../../../shared/prActions";
import { reviewButtonModes } from "../../../../../shared/reviewButtonModes";
import { reviewHarnessChoices } from "./reviewHarnessChoices";
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
	const caps = capabilities({
		reviewRefine: { claude: available, codex: available, pi: unavailable },
		reviewApply: { claude: available, codex: unavailable, pi: available },
		highLevelReview: { claude: available, codex: available },
	});

	it("lists each mode once with its engine args unchanged", () => {
		expect(
			reviewModeEntries(caps).map(({ label, args }) => ({ label, args })),
		).toEqual(reviewButtonModes.map(({ label, args }) => ({ label, args })));
	});

	it("offers only the harnesses each mode's feature resolves on, with --harness", () => {
		expect(
			Object.fromEntries(
				reviewModeEntries(caps).map(({ label, alternates }) => [
					label,
					alternates,
				]),
			),
		).toEqual({
			Review: [],
			"Review & refine": [
				{
					harness: "codex",
					args: ["review", "--refine", "--harness", "codex"],
				},
			],
			"Review & apply": [
				{ harness: "pi", args: ["review", "--apply", "--harness", "pi"] },
			],
			"Review & post": [],
			"High-level review": [
				{
					harness: "codex",
					args: ["review", "--high-level", "--harness", "codex"],
				},
			],
		});
	});

	it("offers no alternates when only the engine resolves", () => {
		const entries = reviewModeEntries(
			capabilities({
				reviewRefine: { claude: available, codex: unavailable },
			}),
		);

		expect(entries.every((entry) => entry.alternates.length === 0)).toBe(true);
	});

	it("offers Claude explicitly when the node's engine is another harness", () => {
		const entries = reviewModeEntries({ ...caps, engine: "codex" });

		expect(entries[1].args).toEqual(["review", "--refine"]);
		expect(entries[1].alternates).toEqual([
			{
				harness: "claude",
				args: ["review", "--refine", "--harness", "claude"],
			},
		]);
	});

	it("keeps fix-conflict and Address Comments alternates allowed", () => {
		const entries = reviewModeEntries(
			capabilities({
				fixConflict: { claude: available, codex: available },
				reviewPrComments: { claude: available, codex: unavailable },
			}),
			prActions,
		);

		for (const { alternates } of entries)
			for (const { args } of alternates)
				expect(isAllowedPrArgs(args)).toBe(true);
		expect(
			entries.filter((e) => e.alternates.length > 0).map((e) => e.label),
		).toEqual(["Fix conflicts (merge)", "Fix conflicts (rebase)"]);
	});
});

describe("reviewHarnessChoices", () => {
	it("offers the engine first, then every harness some mode resolves on", () => {
		expect(
			reviewHarnessChoices(
				capabilities({
					reviewRefine: {
						claude: available,
						codex: available,
						pi: unavailable,
					},
					reviewApply: { claude: available, codex: unavailable, pi: available },
				}),
				reviewButtonModes,
			),
		).toEqual(["claude", "codex", "pi"]);
	});

	it("offers only the engine when no other harness resolves", () => {
		expect(reviewHarnessChoices(capabilities({}), reviewButtonModes)).toEqual([
			"claude",
		]);
	});
});
