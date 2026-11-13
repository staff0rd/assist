import { describe, expect, it } from "vitest";
import type { FeatureResolution } from "../../../../../../../../../shared/harnessAdapters/types";
import { harnessChoices } from "./harnessChoices";

const available: FeatureResolution = { available: true };
const missing: FeatureResolution = {
	available: false,
	reasons: [
		{
			capability: "harness.detected",
			reason: "not installed",
			remediation: "install it",
		},
	],
};

describe("harnessChoices", () => {
	it("offers the default harness while resolutions are loading", () => {
		expect(harnessChoices({ features: {} }, "session")).toEqual(["claude"]);
	});

	it("offers every harness where the feature resolves available", () => {
		expect(
			harnessChoices(
				{
					features: {
						session: { claude: available, codex: available, pi: missing },
					},
				},
				"session",
			),
		).toEqual(["claude", "codex"]);
	});

	it("offers Claude (SDK) after Claude only where the resolver reports it available", () => {
		expect(
			harnessChoices(
				{
					features: {
						session: { claude: available, "claude-sdk": available },
						build: { claude: available, "claude-sdk": missing },
					},
				},
				"session",
			),
		).toEqual(["claude", "claude-sdk"]);
		expect(
			harnessChoices(
				{
					features: {
						build: { claude: available, "claude-sdk": missing },
					},
				},
				"build",
			),
		).toEqual(["claude"]);
	});

	it("omits an undetected default harness when another is available", () => {
		expect(
			harnessChoices(
				{ features: { build: { claude: missing, codex: available } } },
				"build",
			),
		).toEqual(["codex"]);
	});
});
