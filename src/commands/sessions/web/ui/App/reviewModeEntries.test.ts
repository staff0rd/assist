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

	it("lists each mode once, unchanged, on the engine", () => {
		expect(reviewModeEntries(caps)).toEqual([
			{ label: "Review", args: ["review"], onHarness: false, disabled: false },
			{
				label: "Review & refine",
				args: ["review", "--refine"],
				onHarness: false,
				disabled: false,
			},
			{
				label: "Review & apply",
				args: ["review", "--apply"],
				onHarness: false,
				disabled: false,
			},
			{
				label: "Review & post",
				args: ["review", "--no-prompt", "--submit"],
				onHarness: false,
				disabled: false,
			},
			{
				label: "High-level review",
				args: ["review", "--high-level"],
				onHarness: false,
				disabled: false,
			},
		]);
	});

	it("adds --harness to harness features and disables those the resolver refuses", () => {
		const entries = reviewModeEntries(caps, undefined, "codex");

		expect(
			entries.map(({ label, args, disabled }) => ({ label, args, disabled })),
		).toEqual([
			{ label: "Review", args: ["review"], disabled: false },
			{
				label: "Review & refine",
				args: ["review", "--refine", "--harness", "codex"],
				disabled: false,
			},
			{
				label: "Review & apply",
				args: ["review", "--apply", "--harness", "codex"],
				disabled: true,
			},
			{
				label: "Review & post",
				args: ["review", "--no-prompt", "--submit"],
				disabled: false,
			},
			{
				label: "High-level review",
				args: ["review", "--high-level", "--harness", "codex"],
				disabled: false,
			},
		]);
	});

	it("passes Claude explicitly when the node's engine is another harness", () => {
		const entries = reviewModeEntries(
			{ ...caps, engine: "codex" },
			undefined,
			"claude",
		);

		expect(entries[1].args).toEqual([
			"review",
			"--refine",
			"--harness",
			"claude",
		]);
	});

	it("keeps fix-conflict and Address Comments args allowed on another harness", () => {
		const entries = reviewModeEntries(
			capabilities({
				fixConflict: { claude: available, codex: available },
				reviewPrComments: { claude: available, codex: unavailable },
			}),
			prActions,
			"codex",
		);

		for (const entry of entries) expect(isAllowedPrArgs(entry.args)).toBe(true);
		expect(entries.filter((e) => e.disabled).map((e) => e.label)).toEqual([
			"Address Comments",
			"Address Comments (auto)",
		]);
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
