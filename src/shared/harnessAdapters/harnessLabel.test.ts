import type { HarnessKind } from "../harnesses";
import { describe, expect, it } from "vitest";
import {
	harnessLabel,
	harnessProductLabel,
	resolveHarness,
} from "./harnessLabel";

const unknownHarness = "future-harness" as HarnessKind;

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

describe("unknown harness kinds", () => {
	it("labels an unknown harness with its raw kind", () => {
		expect(harnessLabel(unknownHarness)).toBe("future-harness");
		expect(harnessProductLabel(unknownHarness)).toBe("future-harness");
	});
});
