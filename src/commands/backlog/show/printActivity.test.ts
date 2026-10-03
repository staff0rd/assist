import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeBacklogItem } from "../../../test/mothers/makeBacklogItem";
import type { GitRef } from "../types";
import { printActivity } from "./printActivity";

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
		printActivity(makeBacklogItem());
		printActivity(makeBacklogItem({ gitRefs: [] }));

		expect(logSpy).not.toHaveBeenCalled();
	});

	it("prints branch, commits, and PR with their URLs", () => {
		printActivity(
			makeBacklogItem({
				gitRefs: [
					{ kind: "branch", ref: "feature", url: "https://gh/tree/feature" },
					{ kind: "commit", ref: "abcdef1234", title: "Do it" },
					{ kind: "pr", ref: "42", title: "My PR", state: "OPEN" },
				],
			}),
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
			makeBacklogItem({
				gitRefs: [
					{ kind: "branch", ref: "deleted-branch" },
					{ kind: "pr", ref: "9" },
				],
			}),
		);

		const out = output();
		expect(out).toContain("deleted-branch");
		expect(out).toContain("#9");
	});

	it("prints a slack ref labelled with its title", () => {
		printActivity(
			makeBacklogItem({
				gitRefs: [
					{
						kind: "slack",
						ref: "https://slack.com/archives/C/p123",
						title: "My PR",
						url: "https://slack.com/archives/C/p123",
					},
				],
			}),
		);

		const out = output();
		expect(out).toContain("slack");
		expect(out).toContain("My PR");
		expect(out).toContain("https://slack.com/archives/C/p123");
	});

	it("prints a session ref labelled with its transcript title", () => {
		printActivity(
			makeBacklogItem({
				gitRefs: [
					{
						kind: "session",
						ref: "0f2a-session-id",
						title: "Attach sessions to backlog items",
					},
				],
			}),
		);

		const out = output();
		expect(out).toContain("session");
		expect(out).toContain("Attach sessions to backlog items");
	});

	it("prints a session with no transcript title by its bare id", () => {
		printActivity(
			makeBacklogItem({
				gitRefs: [{ kind: "session", ref: "0f2a-session-id" }],
			}),
		);

		expect(output()).toContain("0f2a-session-id");
	});

	it("caps the commit list with an overflow indicator", () => {
		const commits: GitRef[] = Array.from({ length: 13 }, (_, i) => ({
			kind: "commit",
			ref: `commit${i}`,
		}));

		printActivity(makeBacklogItem({ gitRefs: commits }));

		const out = output();
		expect(out).toContain("and 3 more commits");
		expect(out).toContain("--all-commits");
		expect(out).not.toContain("commit0");
	});

	it("prints every commit and no overflow line with allCommits", () => {
		const commits: GitRef[] = Array.from({ length: 13 }, (_, i) => ({
			kind: "commit",
			ref: `commit${i}`,
			title: `Subject ${i}`,
		}));

		printActivity(makeBacklogItem({ gitRefs: commits }), { allCommits: true });

		const out = output();
		expect(out).toContain("commit0 Subject 0");
		expect(out).toContain("commit12 Subject 12");
		expect(out).not.toContain("more commits");
	});
});
