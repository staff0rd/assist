import { describe, expect, it } from "vitest";
import { checkAppendOnly } from "./checkAppendOnly";

describe("checkAppendOnly", () => {
	describe("when shipped migrations are unchanged and a new one is added", () => {
		it("returns no findings", () => {
			const baseline = new Map([["migration0001Baseline.ts", "A"]]);
			const current = new Map([
				["migration0001Baseline.ts", "A"],
				["migration0002New.ts", "B"],
			]);
			expect(checkAppendOnly(baseline, current)).toEqual([]);
		});
	});

	describe("when a shipped migration's content changed", () => {
		it("flags it as modified", () => {
			const baseline = new Map([["migration0001Baseline.ts", "A"]]);
			const current = new Map([["migration0001Baseline.ts", "A-edited"]]);
			expect(checkAppendOnly(baseline, current)).toEqual([
				{ file: "migration0001Baseline.ts", kind: "modified" },
			]);
		});
	});

	describe("when a shipped migration was removed", () => {
		it("flags it as removed", () => {
			const baseline = new Map([["migration0001Baseline.ts", "A"]]);
			const current = new Map<string, string>();
			expect(checkAppendOnly(baseline, current)).toEqual([
				{ file: "migration0001Baseline.ts", kind: "removed" },
			]);
		});
	});
});
