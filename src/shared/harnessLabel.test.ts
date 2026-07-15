import { describe, expect, it } from "vitest";
import { harnessLabel, resolveHarness } from "./harnessLabel";

describe("resolveHarness", () => {
	it("defaults an absent harness to claude", () => {
		expect(resolveHarness(undefined)).toBe("claude");
	});

	it("passes an explicit harness through", () => {
		expect(resolveHarness("pi")).toBe("pi");
	});
});

describe("harnessLabel", () => {
	it("labels each harness", () => {
		expect(harnessLabel("claude")).toBe("Claude");
		expect(harnessLabel("codex")).toBe("Codex");
		expect(harnessLabel("pi")).toBe("pi");
	});

	it("falls back to the Claude label when absent", () => {
		expect(harnessLabel(undefined)).toBe("Claude");
	});
});
