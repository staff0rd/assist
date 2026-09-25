import { describe, expect, it } from "vitest";
import type { ItemStatusCounts } from "../../../gitStatus";
import { sessionDiffAffordance } from "./sessionDiffAffordance";

const clean = {
	new: [],
	modified: [],
	deleted: [],
	uncommitted: { new: [], modified: [], deleted: [] },
	hasCommits: true,
} satisfies ItemStatusCounts;

const onBranch = {
	branch: "feature/x",
	defaultBranch: "origin/main",
	onDefaultBranch: false,
};

describe("sessionDiffAffordance", () => {
	it("offers nothing before the first poll answers", () => {
		expect(sessionDiffAffordance(null)).toBeNull();
	});

	it("offers the counts when there are changes", () => {
		const affordance = sessionDiffAffordance({
			...clean,
			new: ["a.ts"],
			modified: ["b.ts"],
		});

		expect(affordance).toEqual({
			kind: "counts",
			groups: [
				{ key: "new", prefix: "+", color: "success.main", count: 1 },
				{ key: "modified", prefix: "~", color: "warning.main", count: 1 },
			],
			uncommitted: [],
		});
	});

	it("offers the counts when only the working tree is dirty", () => {
		const affordance = sessionDiffAffordance({
			...clean,
			uncommitted: { new: ["a.ts"], modified: [], deleted: [] },
		});

		expect(affordance?.kind).toBe("counts");
	});

	it("offers the branch diff for a clean non-default branch", () => {
		expect(sessionDiffAffordance({ ...clean, ...onBranch })).toEqual({
			kind: "branch",
			defaultBranch: "origin/main",
		});
	});

	it("offers the branch diff when there is no backlog change set", () => {
		expect(
			sessionDiffAffordance({
				new: [],
				modified: [],
				deleted: [],
				...onBranch,
			}),
		).toEqual({ kind: "branch", defaultBranch: "origin/main" });
	});

	it("offers nothing on a clean default branch", () => {
		expect(
			sessionDiffAffordance({
				...clean,
				branch: "main",
				defaultBranch: "origin/main",
				onDefaultBranch: true,
			}),
		).toBeNull();
	});

	it("offers nothing when no default branch resolves", () => {
		expect(
			sessionDiffAffordance({
				...clean,
				branch: "feature/x",
				defaultBranch: null,
				onDefaultBranch: false,
			}),
		).toBeNull();
	});

	it("offers nothing when the server sent no branch information", () => {
		expect(sessionDiffAffordance(clean)).toBeNull();
	});

	it("survives a response missing the count arrays", () => {
		expect(sessionDiffAffordance({} as ItemStatusCounts)).toBeNull();
	});

	it("survives an uncommitted block missing count arrays", () => {
		expect(
			sessionDiffAffordance({
				...clean,
				uncommitted: {} as ItemStatusCounts,
			}),
		).toBeNull();
	});

	it("prefers the counts over the branch diff when both apply", () => {
		expect(
			sessionDiffAffordance({ ...clean, ...onBranch, new: ["a.ts"] })?.kind,
		).toBe("counts");
	});
});
