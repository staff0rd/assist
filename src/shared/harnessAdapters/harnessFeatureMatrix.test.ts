import { describe, expect, it } from "vitest";
import { fakeHarnessMock } from "../../test/mocks/fakeHarnessMock";
import { harnessLabel } from "../harnessLabel";
import { type HarnessKind, harnesses } from "../harnesses";
import { capabilityDefinitions } from "./capabilityDefinitions";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
import { harnessFeatures } from "./harnessFeatures";
import { resolveCapability } from "./resolveCapability";
import { resolveFeature } from "./resolveFeature";
import type { CapabilityDeclarations, HarnessCapabilitySource } from "./types";
import { unsupported } from "./unsupported";

const FOLLOW_UP_ITEM = /^a[0-9a-f]+$/;

const fake = fakeHarnessMock();
const sources: Record<string, HarnessCapabilitySource> = {
	...Object.fromEntries(
		(Object.keys(harnesses) as HarnessKind[]).map((kind) => [
			kind,
			{
				label: harnessLabel(kind),
				capabilities: harnessCapabilityDeclarations[kind],
			},
		]),
	),
	fake: { label: fake.label, capabilities: fake.capabilities },
};

const EXPECTED_MATRIX: Record<string, Record<string, boolean>> = {
	refine: { claude: true, codex: true, pi: true, fake: true },
	draft: { claude: true, codex: true, pi: true, fake: true },
	bug: { claude: true, codex: true, pi: true, fake: true },
	build: { claude: true, codex: true, pi: true, fake: true },
	session: { claude: true, codex: true, pi: true, fake: true },
	conversationResume: { claude: true, codex: true, pi: false, fake: true },
	conversationRecovery: { claude: true, codex: true, pi: false, fake: true },
	divergenceEscalation: { claude: true, codex: true, pi: true, fake: true },
	branchSlug: { claude: true, codex: true, pi: false, fake: true },
	sessionTitle: { claude: true, codex: true, pi: false, fake: true },
	messagePreviews: { claude: true, codex: true, pi: false, fake: true },
	transcriptStatus: { claude: true, codex: true, pi: false, fake: true },
	transcriptTitle: { claude: true, codex: true, pi: false, fake: true },
	diffCommitScope: { claude: true, codex: true, pi: false, fake: true },
	writeAttribution: { claude: true, codex: true, pi: false, fake: true },
	diffComments: { claude: true, codex: true, pi: true, fake: true },
	usageLimits: { claude: true, codex: true, pi: false, fake: true },
	inbox: { claude: true, codex: false, pi: false, fake: true },
	previewQuestions: { claude: true, codex: false, pi: true, fake: true },
	design: { claude: true, codex: false, pi: false, fake: true },
	designReview: { claude: true, codex: false, pi: false, fake: true },
	reviewer: { claude: true, codex: true, pi: false, fake: true },
	reviewSynthesis: { claude: true, codex: true, pi: false, fake: true },
	reviewRefine: { claude: true, codex: true, pi: true, fake: true },
	reviewApply: { claude: true, codex: true, pi: true, fake: true },
	reviewBacklog: { claude: true, codex: true, pi: true, fake: true },
	reviewCheckout: { claude: true, codex: true, pi: true, fake: true },
	highLevelReview: { claude: true, codex: false, pi: false, fake: true },
	highLevelGlobs: { claude: true, codex: true, pi: false, fake: true },
	fixConflict: { claude: true, codex: true, pi: true, fake: true },
	reviewPrComments: { claude: true, codex: true, pi: true, fake: true },
};

const cells = harnessFeatures.flatMap((feature) =>
	Object.entries(sources).map(([harness, source]) => ({
		feature,
		harness,
		source,
	})),
);

describe("feature × harness matrix", () => {
	it("lists an expected cell for every feature and harness", () => {
		expect(Object.keys(EXPECTED_MATRIX).sort()).toEqual(
			harnessFeatures.map((f) => f.id).sort(),
		);
		for (const row of Object.values(EXPECTED_MATRIX))
			expect(Object.keys(row).sort()).toEqual(Object.keys(sources).sort());
	});

	it.each(cells)(
		"$feature.id on $harness resolves as expected",
		({ feature, harness, source }) => {
			const resolution = resolveFeature(feature, source);
			expect(resolution.available).toBe(EXPECTED_MATRIX[feature.id][harness]);
			if (resolution.available) return;
			expect(resolution.reasons.length).toBeGreaterThan(0);
			for (const reason of resolution.reasons) {
				expect(reason.reason).not.toBe("");
				expect(reason.remediation).not.toBe("");
				expect(reason.followUp).toMatch(FOLLOW_UP_ITEM);
			}
		},
	);
});

describe.each(Object.entries(sources))(
	"%s capability declarations",
	(_harness, source) => {
		const capabilities: CapabilityDeclarations = source.capabilities;

		it("declares every defined capability", () => {
			expect(Object.keys(capabilities).sort()).toEqual(
				Object.keys(capabilityDefinitions).sort(),
			);
		});

		it("gives every unsupported capability a reason and remediation", () => {
			for (const id of Object.keys(
				capabilityDefinitions,
			) as (keyof typeof capabilityDefinitions)[]) {
				const status = resolveCapability(capabilities, id);
				if (status.supported) continue;
				expect(status.reason).not.toBe("");
				expect(status.remediation).not.toBe("");
				if (status.followUp) expect(status.followUp).toMatch(FOLLOW_UP_ITEM);
			}
		});
	},
);

describe("enforcement fails closed", () => {
	const enforced = harnessFeatures.filter((feature) =>
		feature.requires.some((capability) => capability.startsWith("intercept.")),
	);

	it.each(["intercept.command", "intercept.fileRead", "intercept.fileWrite"])(
		"a harness that cannot enforce %s cannot run editing workflows",
		(capability) => {
			const blind: HarnessCapabilitySource = {
				label: "Blind",
				capabilities: {
					...fake.capabilities,
					[capability]: unsupported("cannot intercept", "use another harness"),
				},
			};
			const unavailable = harnessFeatures
				.filter((feature) => !resolveFeature(feature, blind).available)
				.map((feature) => feature.id);
			expect(unavailable).toEqual(
				expect.arrayContaining([
					"build",
					"session",
					"refine",
					"reviewApply",
					"fixConflict",
					"reviewPrComments",
				]),
			);
			for (const id of unavailable)
				expect(enforced.map((feature) => feature.id)).toContain(id);
		},
	);

	it("a harness that cannot route questions loses only preview-pane questions", () => {
		const blind: HarnessCapabilitySource = {
			label: "Blind",
			capabilities: {
				...fake.capabilities,
				"intercept.question": unsupported("cannot intercept", "ask in chat"),
			},
		};
		expect(
			harnessFeatures
				.filter((feature) => !resolveFeature(feature, blind).available)
				.map((feature) => feature.id),
		).toEqual(["previewQuestions"]);
	});
});
