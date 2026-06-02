import { describe, expect, it } from "vitest";
import { applyAcMutations, hasAcMutations } from "./applyAcMutations";

const base = ["first", "second", "third"];

describe("hasAcMutations", () => {
	it("is false when no granular flags are set", () => {
		expect(hasAcMutations({})).toBe(false);
		expect(hasAcMutations({ addAc: [] })).toBe(false);
	});

	it("is true when any granular flag is set", () => {
		expect(hasAcMutations({ addAc: ["x"] })).toBe(true);
		expect(hasAcMutations({ editAc: ["1", "x"] })).toBe(true);
		expect(hasAcMutations({ removeAc: "1" })).toBe(true);
	});
});

describe("applyAcMutations", () => {
	it("appends without touching existing criteria", () => {
		const result = applyAcMutations(base, { addAc: ["fourth", "fifth"] });
		expect(result).toEqual({
			ok: true,
			criteria: ["first", "second", "third", "fourth", "fifth"],
		});
	});

	it("edits a criterion in place by 1-based index", () => {
		const result = applyAcMutations(base, { editAc: ["2", "new", "text"] });
		expect(result).toEqual({
			ok: true,
			criteria: ["first", "new text", "third"],
		});
	});

	it("removes a criterion and renumbers the rest", () => {
		const result = applyAcMutations(base, { removeAc: "1" });
		expect(result).toEqual({ ok: true, criteria: ["second", "third"] });
	});

	it("does not mutate the input array", () => {
		applyAcMutations(base, { removeAc: "1", addAc: ["x"] });
		expect(base).toEqual(["first", "second", "third"]);
	});

	it("errors on an out-of-range edit index", () => {
		const result = applyAcMutations(base, { editAc: ["4", "x"] });
		expect(result.ok).toBe(false);
		expect(result).toMatchObject({ error: expect.stringContaining("range") });
	});

	it("errors on an out-of-range remove index", () => {
		const result = applyAcMutations(base, { removeAc: "0" });
		expect(result.ok).toBe(false);
	});

	it("errors on a non-integer index", () => {
		const result = applyAcMutations(base, { removeAc: "abc" });
		expect(result.ok).toBe(false);
		expect(result).toMatchObject({
			error: expect.stringContaining("positive integer"),
		});
	});

	it("errors when edit is missing replacement text", () => {
		const result = applyAcMutations(base, { editAc: ["2"] });
		expect(result.ok).toBe(false);
	});
});
