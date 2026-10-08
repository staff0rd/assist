import { describe, expect, it } from "vitest";
import { nextTopItem } from "./nextTopItem";
import type { NextIssue, NextPickup, NextPr, NextSection } from "./types";

const section = <T>(...items: T[]): NextSection<T> => ({ items, error: null });

const pr = { url: "pr" } as NextPr;
const mine = { url: "mine" } as NextPr;
const issue = { url: "issue" } as NextIssue;
const pickup = { url: "pickup" } as NextPickup;

describe("nextTopItem", () => {
	it("ranks peer PRs above assigned issues and pickups", () => {
		expect(
			nextTopItem({
				peerPrs: section(pr),
				myPrs: section(mine),
				assignedIssues: section(issue),
				pickups: section(pickup),
			}),
		).toEqual({ kind: "pr", item: pr });
	});

	it("ranks assigned issues above pickups", () => {
		expect(
			nextTopItem({
				peerPrs: section(),
				myPrs: section(mine),
				assignedIssues: section(issue),
				pickups: section(pickup),
			}),
		).toEqual({ kind: "issue", item: issue });
	});

	it("ranks pickups above your own PRs", () => {
		expect(
			nextTopItem({
				peerPrs: { items: [], error: "o/r: failed" },
				myPrs: section(mine),
				assignedIssues: section(),
				pickups: section(pickup),
			}),
		).toEqual({ kind: "pickup", item: pickup });
	});

	it("recommends your own PR only when nothing else is waiting", () => {
		expect(
			nextTopItem({
				peerPrs: section(),
				myPrs: section(mine),
				assignedIssues: { items: [], error: "o/r: failed" },
				pickups: section(),
			}),
		).toEqual({ kind: "mine", item: mine });
	});

	it("recommends nothing when every source is empty", () => {
		expect(
			nextTopItem({
				peerPrs: section(),
				myPrs: section(),
				assignedIssues: section(),
				pickups: section(),
			}),
		).toBeNull();
	});
});
