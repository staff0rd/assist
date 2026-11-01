import { describe, expect, it } from "vitest";
import type { Commit } from "../types";
import { findTargetWeek, groupCommitsByWeek } from "./findTargetWeek";

function commit(date: string, hash: string): Commit {
	return { date, hash, message: hash, files: [] };
}

describe("groupCommitsByWeek", () => {
	it("groups dates into ISO weeks in chronological order", () => {
		const byDate = new Map([
			["2026-11-01", [commit("2026-11-01", "c"), commit("2026-11-01", "b")]],
			["2026-10-26", [commit("2026-10-26", "a")]],
			["2026-10-25", [commit("2026-10-25", "z")]],
		]);
		const byWeek = groupCommitsByWeek(byDate);
		expect(byWeek.get("2026-W44")?.map((c) => c.hash)).toEqual(["a", "b", "c"]);
		expect(byWeek.get("2026-W43")?.map((c) => c.hash)).toEqual(["z"]);
	});

	it("puts a year-boundary week under its ISO year", () => {
		const byDate = new Map([
			["2026-12-31", [commit("2026-12-31", "a")]],
			["2027-01-02", [commit("2027-01-02", "b")]],
		]);
		expect(Array.from(groupCommitsByWeek(byDate).keys())).toEqual(["2026-W53"]);
	});
});

describe("findTargetWeek", () => {
	const weeks = ["2026-W42", "2026-W43", "2026-W44"];

	it("returns the earliest completed week after the last entry", () => {
		expect(
			findTargetWeek(weeks, {
				lastWeek: "2026-W42",
				skip: new Set(),
				today: "2026-11-05",
			}),
		).toBe("2026-W43");
	});

	it("skips weeks in the skip list", () => {
		expect(
			findTargetWeek(weeks, {
				lastWeek: null,
				skip: new Set(["2026-W42", "2026-W43"]),
				today: "2026-11-05",
			}),
		).toBe("2026-W44");
	});

	it("never offers the in-progress week", () => {
		expect(
			findTargetWeek(weeks, {
				lastWeek: "2026-W43",
				skip: new Set(),
				today: "2026-11-01",
			}),
		).toBeUndefined();
	});

	it("orders weeks across the year boundary", () => {
		expect(
			findTargetWeek(["2027-W01", "2026-W53"], {
				lastWeek: "2026-W52",
				skip: new Set(),
				today: "2027-01-20",
			}),
		).toBe("2026-W53");
	});
});
