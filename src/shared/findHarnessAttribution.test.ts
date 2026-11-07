import { describe, expect, it } from "vitest";
import { findHarnessAttribution } from "./findHarnessAttribution";

describe("findHarnessAttribution", () => {
	it("finds the Codex co-author trailer regardless of case", () => {
		expect(
			findHarnessAttribution("Co-Authored-By: Codex <noreply@openai.com>"),
		).toBe("co-authored-by: codex");
	});

	it("finds the Codex generated-with footer", () => {
		expect(
			findHarnessAttribution(
				"Generated with [Codex](https://openai.com/codex/).",
			),
		).toBe("generated with [codex]");
	});

	it("allows plain mentions of codex", () => {
		expect(findHarnessAttribution("fix: allow network in Codex sandbox")).toBe(
			undefined,
		);
	});
});
