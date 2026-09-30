import { describe, expect, it } from "vitest";
import { nextTopItem } from "./nextTopItem";
import type { NextIssue, NextPickup, NextPr, NextSection } from "./types";

const section = <T>(...items: T[]): NextSection<T> => ({ items, error: null });

const pr = { url: "pr" } as NextPr;
const issue = { url: "issue" } as NextIssue;
const pickup = { url: "pickup" } as NextPickup;

describe("nextTopItem", () => {
	it("ranks peer PRs above assigned issues and pickups", () => {
		expect(
			nextTopItem({
				peerPrs: section(pr),
				assignedIssues: section(issue),
				pickups: section(pickup),
			}),
		).toEqual({ kind: "pr", item: pr });
	});

	it("ranks assigned issues above pickups", () => {
		expect(
			nextTopItem({
				peerPrs: section(),
				assignedIssues: section(issue),
				pickups: section(pickup),
			}),
		).toEqual({ kind: "issue", item: issue });
	});

	it("recommends a pickup only when nothing else is waiting", () => {
		expect(
			nextTopItem({
				peerPrs: { items: [], error: "o/r: failed" },
				assignedIssues: section(),
				pickups: section(pickup),
			}),
		).toEqual({ kind: "pickup", item: pickup });
	});

	it("recommends nothing when every source is empty", () => {
		expect(
			nextTopItem({
				peerPrs: section(),
				assignedIssues: section(),
				pickups: section(),
			}),
		).toBeNull();
	});
});
