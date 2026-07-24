import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BacklogItem, GitRef } from "../types";
import { printActivity } from "./printActivity";

function item(gitRefs?: GitRef[]): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "Item",
		acceptanceCriteria: [],
		status: "in-progress",
		starred: false,
		...(gitRefs ? { gitRefs } : {}),
	};
}

describe("printActivity", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
	});

	const output = () =>
		logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");

	it("prints nothing when there are no refs", () => {
		printActivity(item());
		printActivity(item([]));

		expect(logSpy).not.toHaveBeenCalled();
	});

	it("prints branch, commits, and PR with their URLs", () => {
		printActivity(
			item([
				{ kind: "branch", ref: "feature", url: "https://gh/tree/feature" },
				{ kind: "commit", ref: "abcdef1234", title: "Do it" },
				{ kind: "pr", ref: "42", title: "My PR", state: "OPEN" },
			]),
		);

		const out = output();
		expect(out).toContain("Activity");
		expect(out).toContain("feature");
		expect(out).toContain("abcdef12");
		expect(out).toContain("Do it");
		expect(out).toContain("#42");
		expect(out).toContain("(open)");
	});

	it("renders gracefully when a ref has no URL (branch/PR gone)", () => {
		printActivity(
			item([
				{ kind: "branch", ref: "deleted-branch" },
				{ kind: "pr", ref: "9" },
			]),
		);

		const out = output();
		expect(out).toContain("deleted-branch");
		expect(out).toContain("#9");
	});

	it("prints a slack ref labelled with its title", () => {
		printActivity(
			item([
				{
					kind: "slack",
					ref: "https://slack.com/archives/C/p123",
					title: "My PR",
					url: "https://slack.com/archives/C/p123",
				},
			]),
		);

		const out = output();
		expect(out).toContain("slack");
		expect(out).toContain("My PR");
		expect(out).toContain("https://slack.com/archives/C/p123");
	});

	it("caps the commit list with an overflow indicator", () => {
		const commits: GitRef[] = Array.from({ length: 13 }, (_, i) => ({
			kind: "commit",
			ref: `commit${i}`,
		}));

		printActivity(item(commits));

		const out = output();
		expect(out).toContain("and 3 more commits");
	});
});
