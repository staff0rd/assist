import { describe, expect, it } from "vitest";
import type { PrSummary } from "../../../../../../../../../prList";
import { filterPrs } from "./filterPrs";

function pr(number: number, title: string, author: string): PrSummary {
	return {
		number,
		title,
		author,
		createdAt: "2026-01-01T00:00:00Z",
		url: `https://github.com/org/repo/pull/${number}`,
	};
}

const prs = [
	pr(1, "Add session filtering", "Stafford Williams"),
	pr(2, "Fix daemon restart", "Ada Lovelace"),
	pr(3, "Bump deps", "renovate"),
];

describe("filterPrs", () => {
	it("returns every PR when the query is blank", () => {
		expect(filterPrs(prs, "")).toEqual(prs);
		expect(filterPrs(prs, "   ")).toEqual(prs);
	});

	it("matches a substring of the title", () => {
		expect(filterPrs(prs, "daemon")).toEqual([prs[1]]);
	});

	it("matches a substring of the author", () => {
		expect(filterPrs(prs, "lovelace")).toEqual([prs[1]]);
	});

	it("ignores case in both the query and the fields", () => {
		expect(filterPrs(prs, "SESSION")).toEqual([prs[0]]);
		expect(filterPrs(prs, "RENOVATE")).toEqual([prs[2]]);
	});

	it("keeps PRs matching on either field", () => {
		expect(filterPrs(prs, "a")).toEqual(prs);
	});

	it("returns an empty list when nothing matches", () => {
		expect(filterPrs(prs, "nope")).toEqual([]);
	});
});
