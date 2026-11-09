import { describe, expect, it } from "vitest";
import { inboxHarnessOptions } from "./inboxHarnessOptions";

describe("inboxHarnessOptions", () => {
	it("offers each other harness, marking unavailable ones with their reasons", () => {
		expect(
			inboxHarnessOptions({
				exposeCodexActions: true,
				exposePiActions: true,
				engine: "codex",
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
		).toEqual([
			{
				kind: "codex",
				label: "Scan with Codex",
				unavailable: "no Gmail; no allow-list",
			},
			{ kind: "pi", label: "Scan with pi" },
		]);
	});

	it("offers nothing before capabilities load", () => {
		expect(
			inboxHarnessOptions({
				exposeCodexActions: false,
				exposePiActions: false,
				engine: "claude",
				features: {},
			}),
		).toEqual([]);
	});
});
