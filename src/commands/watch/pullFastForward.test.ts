import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockExecFileSync = vi.mocked(execFileSync);

import { describePull } from "./describePull";
import { pullFastForward } from "./pullFastForward";

type GitReply = string | (() => string) | { fails: string };

const OLD_SHA = "aaa1111111111";
const NEW_SHA = "bbb2222222222";

const absent: GitReply = { fails: "" };

const cleanRepo: Record<string, GitReply> = {
	"status --porcelain": "",
	"rev-parse --verify --quiet MERGE_HEAD": absent,
	"rev-parse --verify --quiet REBASE_HEAD": absent,
};

function stubGit(replies: Record<string, GitReply>): void {
	mockExecFileSync.mockImplementation((_cmd, args) => {
		const key = (args ?? []).join(" ");
		const reply = replies[key];
		if (reply === undefined) throw new Error(`unexpected git ${key}`);
		if (typeof reply === "object") {
			throw Object.assign(new Error("Command failed"), { stderr: reply.fails });
		}
		return `${typeof reply === "function" ? reply() : reply}\n`;
	});
}

function invokedGit(): string[] {
	return mockExecFileSync.mock.calls.map((call) =>
		(call[1] as string[]).join(" "),
	);
}

describe("pullFastForward", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("pulls --ff-only and reports the resulting sha", () => {
		stubGit({
			"pull --ff-only": "Updating aaa1111..bbb2222",
			"rev-parse @": NEW_SHA,
		});

		expect(pullFastForward()).toEqual({ kind: "fast-forwarded", sha: NEW_SHA });
		expect(invokedGit()).toEqual(["pull --ff-only", "rev-parse @"]);
	});

	it("merges --ff-only when the branch is merely behind and the pull step failed", () => {
		let head = OLD_SHA;
		stubGit({
			...cleanRepo,
			"pull --ff-only": {
				fails: "fatal: unable to access 'https://example/repo': timed out",
			},
			"rev-parse @": () => head,
			"rev-parse @{u}": NEW_SHA,
			"merge-base --is-ancestor @ @{u}": "",
			"merge --ff-only @{u}": () => {
				head = NEW_SHA;
				return "Updating aaa1111..bbb2222";
			},
		});

		expect(pullFastForward()).toEqual({ kind: "fast-forwarded", sha: NEW_SHA });
		expect(invokedGit()).toContain("merge --ff-only @{u}");
		expect(invokedGit().join("\n")).not.toContain("stash");
	});

	it("stashes a dirty tree around the merge and restores it afterwards", () => {
		let head = OLD_SHA;
		let dirty = true;
		stubGit({
			...cleanRepo,
			"pull --ff-only": {
				fails:
					"error: Your local changes to the following files would be overwritten by merge:\n\tsrc/app.ts",
			},
			"status --porcelain": () => (dirty ? " M src/app.ts" : ""),
			"rev-parse @": () => head,
			"rev-parse @{u}": NEW_SHA,
			"merge-base --is-ancestor @ @{u}": "",
			"stash push --include-untracked --message assist watch": () => {
				dirty = false;
				return "Saved working directory";
			},
			"merge --ff-only @{u}": () => {
				head = NEW_SHA;
				return "Updating aaa1111..bbb2222";
			},
			"stash pop": () => {
				dirty = true;
				return "Dropped refs/stash@{0}";
			},
		});

		expect(pullFastForward()).toEqual({ kind: "fast-forwarded", sha: NEW_SHA });
		expect(invokedGit()).toEqual(
			expect.arrayContaining([
				"stash push --include-untracked --message assist watch",
				"merge --ff-only @{u}",
				"stash pop",
			]),
		);
		const order = invokedGit();
		expect(
			order.indexOf("stash push --include-untracked --message assist watch"),
		).toBeLessThan(order.indexOf("merge --ff-only @{u}"));
		expect(order.indexOf("merge --ff-only @{u}")).toBeLessThan(
			order.indexOf("stash pop"),
		);
		expect(dirty).toBe(true);
	});

	it("restores the stash even when the merge fails", () => {
		stubGit({
			...cleanRepo,
			"pull --ff-only": { fails: "error: local changes would be overwritten" },
			"status --porcelain": " M src/app.ts",
			"rev-parse @": OLD_SHA,
			"rev-parse @{u}": NEW_SHA,
			"merge-base --is-ancestor @ @{u}": "",
			"stash push --include-untracked --message assist watch":
				"Saved working directory",
			"merge --ff-only @{u}": {
				fails: "fatal: Not possible to fast-forward, aborting.",
			},
			"stash pop": "Dropped refs/stash@{0}",
		});

		const result = pullFastForward();

		expect(result).toEqual({
			kind: "blocked",
			reason: "fatal: Not possible to fast-forward, aborting.",
		});
		expect(invokedGit()).toContain("stash pop");
		expect(describePull(result).exitCode).toBe(3);
	});

	it("reports a conflicting stash pop as blocked", () => {
		let head = OLD_SHA;
		stubGit({
			...cleanRepo,
			"pull --ff-only": { fails: "error: local changes would be overwritten" },
			"status --porcelain": " M src/app.ts",
			"rev-parse @": () => head,
			"rev-parse @{u}": NEW_SHA,
			"merge-base --is-ancestor @ @{u}": "",
			"stash push --include-untracked --message assist watch":
				"Saved working directory",
			"merge --ff-only @{u}": () => {
				head = NEW_SHA;
				return "Updating aaa1111..bbb2222";
			},
			"stash pop": {
				fails: "CONFLICT (content): Merge conflict in src/app.ts",
			},
		});

		const result = pullFastForward();

		expect(result).toEqual({
			kind: "blocked",
			reason: "CONFLICT (content): Merge conflict in src/app.ts",
		});
		expect(describePull(result).exitCode).toBe(3);
	});

	it("treats a branch the fetch already advanced as fast-forwarded", () => {
		stubGit({
			...cleanRepo,
			"pull --ff-only": {
				fails: "fatal: unable to access 'https://example/repo': timed out",
			},
			"rev-parse @": NEW_SHA,
			"rev-parse @{u}": NEW_SHA,
		});

		expect(pullFastForward()).toEqual({ kind: "fast-forwarded", sha: NEW_SHA });
		expect(invokedGit().join("\n")).not.toContain("merge --ff-only");
		expect(invokedGit().join("\n")).not.toContain("stash");
	});

	it("reports git's reason and exit 3 when local commits are not on the remote", () => {
		stubGit({
			...cleanRepo,
			"pull --ff-only": {
				fails: "fatal: Not possible to fast-forward, aborting.",
			},
			"rev-parse @": OLD_SHA,
			"rev-parse @{u}": NEW_SHA,
			"merge-base --is-ancestor @ @{u}": { fails: "" },
		});

		const result = pullFastForward();

		expect(result).toEqual({
			kind: "blocked",
			reason: "fatal: Not possible to fast-forward, aborting.",
		});
		expect(describePull(result).exitCode).toBe(3);
		expect(invokedGit().join("\n")).not.toContain("stash");
	});

	it("reports git's reason and exit 3 when a merge is in progress", () => {
		stubGit({
			...cleanRepo,
			"pull --ff-only": {
				fails:
					"fatal: You have not concluded your merge (MERGE_HEAD exists).\nPlease, commit your changes before you merge.",
			},
			"rev-parse --verify --quiet MERGE_HEAD": "ccc3333333333",
		});

		const result = pullFastForward();

		expect(result).toEqual({
			kind: "blocked",
			reason:
				"fatal: You have not concluded your merge (MERGE_HEAD exists).\nPlease, commit your changes before you merge.",
		});
		expect(describePull(result).exitCode).toBe(3);
		expect(invokedGit().join("\n")).not.toContain("stash");
		expect(invokedGit().join("\n")).not.toContain("merge --ff-only");
	});

	it("reports git's reason and exit 3 when a rebase is in progress", () => {
		stubGit({
			...cleanRepo,
			"pull --ff-only": {
				fails:
					"fatal: It seems that there is already a rebase-merge directory, and I wonder if you are in the middle of another rebase.",
			},
			"rev-parse --verify --quiet REBASE_HEAD": "ccc3333333333",
		});

		const result = pullFastForward();

		expect(result).toEqual({
			kind: "blocked",
			reason:
				"fatal: It seems that there is already a rebase-merge directory, and I wonder if you are in the middle of another rebase.",
		});
		expect(describePull(result).exitCode).toBe(3);
		expect(invokedGit().join("\n")).not.toContain("stash");
	});

	it("never forces, rebases, or resets", () => {
		let head = OLD_SHA;
		stubGit({
			...cleanRepo,
			"pull --ff-only": { fails: "error: local changes would be overwritten" },
			"status --porcelain": " M src/app.ts",
			"rev-parse @": () => head,
			"rev-parse @{u}": NEW_SHA,
			"merge-base --is-ancestor @ @{u}": "",
			"stash push --include-untracked --message assist watch":
				"Saved working directory",
			"merge --ff-only @{u}": () => {
				head = NEW_SHA;
				return "Updating aaa1111..bbb2222";
			},
			"stash pop": "Dropped refs/stash@{0}",
		});

		pullFastForward();

		for (const call of mockExecFileSync.mock.calls) {
			const args = call[1] as string[];
			expect(["rebase", "reset", "push", "checkout"]).not.toContain(args[0]);
			expect(args).not.toContain("--force");
			expect(args).not.toContain("--hard");
		}
	});
});
