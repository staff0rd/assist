import { describe, expect, it } from "vitest";
import { inboxHarnessOptions } from "./inboxHarnessOptions";

describe("inboxHarnessOptions", () => {
	it("offers only other harnesses where the inbox scan resolves available", () => {
		expect(
			inboxHarnessOptions({
				exposeCodexActions: true,
				exposePiActions: true,
				engine: "codex",
				runHarness: "codex",
				features: {
					inbox: {
						claude: { available: true },
						codex: {
							available: false,
							reasons: [
								{
									capability: "connector.gmail.read",
									reason: "no Gmail",
									remediation: "use Claude",
								},
								{
									capability: "tools.restrict",
									reason: "no allow-list",
									remediation: "use Claude",
								},
							],
						},
						pi: { available: true },
					},
				},
			}),
		).toEqual([{ kind: "pi", label: "Scan with pi" }]);
	});

	it("offers nothing before capabilities load", () => {
		expect(
			inboxHarnessOptions({
				exposeCodexActions: false,
				exposePiActions: false,
				engine: "claude",
				runHarness: "claude",
				features: {},
			}),
		).toEqual([]);
	});
});
