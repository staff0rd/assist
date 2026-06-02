import { describe, expect, it } from "vitest";
import { applyListMutations, hasListMutations } from "./applyListMutations";

const base = ["first", "second", "third"];
const flags = {
	add: "--add-task",
	edit: "--edit-task",
	remove: "--remove-task",
};

describe("hasListMutations", () => {
	it("is false when no granular flags are set", () => {
		expect(hasListMutations({})).toBe(false);
		expect(hasListMutations({ add: [] })).toBe(false);
	});

	it("is true when any granular flag is set", () => {
		expect(hasListMutations({ add: ["x"] })).toBe(true);
		expect(hasListMutations({ edit: ["1", "x"] })).toBe(true);
		expect(hasListMutations({ remove: "1" })).toBe(true);
	});
});

describe("applyListMutations", () => {
	it("appends without touching existing items", () => {
		const result = applyListMutations(
			base,
			{ add: ["fourth", "fifth"] },
			flags,
		);
		expect(result).toEqual({
			ok: true,
			items: ["first", "second", "third", "fourth", "fifth"],
		});
	});

	it("edits an item in place by 1-based index", () => {
		const result = applyListMutations(
			base,
			{ edit: ["2", "new", "text"] },
			flags,
		);
		expect(result).toEqual({
			ok: true,
			items: ["first", "new text", "third"],
		});
	});

	it("removes an item and renumbers the rest", () => {
		const result = applyListMutations(base, { remove: "1" }, flags);
		expect(result).toEqual({ ok: true, items: ["second", "third"] });
	});

	it("does not mutate the input array", () => {
		applyListMutations(base, { remove: "1", add: ["x"] }, flags);
		expect(base).toEqual(["first", "second", "third"]);
	});

	it("errors on an out-of-range index using the provided flag label", () => {
		const result = applyListMutations(base, { edit: ["4", "x"] }, flags);
		expect(result.ok).toBe(false);
		expect(result).toMatchObject({
			error: expect.stringContaining("--edit-task index"),
		});
	});

	it("errors on a non-integer index", () => {
		const result = applyListMutations(base, { remove: "abc" }, flags);
		expect(result.ok).toBe(false);
		expect(result).toMatchObject({
			error: expect.stringContaining("positive integer"),
		});
	});

	it("errors when edit is missing replacement text", () => {
		const result = applyListMutations(base, { edit: ["2"] }, flags);
		expect(result.ok).toBe(false);
		expect(result).toMatchObject({
			error: expect.stringContaining("--edit-task requires"),
		});
	});

	it("applies edit, then remove, then add against the original indices", () => {
		const result = applyListMutations(
			base,
			{ edit: ["1", "edited"], remove: "2", add: ["appended"] },
			flags,
		);
		expect(result).toEqual({
			ok: true,
			items: ["edited", "third", "appended"],
		});
	});
});
