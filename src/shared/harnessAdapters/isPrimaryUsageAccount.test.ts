import { describe, expect, it } from "vitest";
import type { HarnessKind } from "../harnesses";
import { isPrimaryUsageAccount } from "./isPrimaryUsageAccount";

describe("isPrimaryUsageAccount", () => {
	it("treats Claude as the primary account and Codex as separate", () => {
		expect(isPrimaryUsageAccount("claude")).toBe(true);
		expect(isPrimaryUsageAccount("codex")).toBe(false);
	});

	it("keeps an unknown harness kind off the primary account instead of throwing", () => {
		expect(isPrimaryUsageAccount("future-harness" as HarnessKind)).toBe(false);
	});
});
