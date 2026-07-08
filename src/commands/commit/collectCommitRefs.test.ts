import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", () => ({
	execSync: vi.fn(),
}));

vi.mock("../../shared/gitRefUrl", () => ({
	gitRefUrl: vi.fn(
		(kind: string, ref: string) =>
			`https://github.com/acme/widgets/${kind === "branch" ? "tree" : "commit"}/${ref}`,
	),
}));

import { execSync } from "node:child_process";
import { collectCommitRefs } from "./collectCommitRefs";

const mockExecSync = execSync as unknown as ReturnType<typeof vi.fn>;

function stubGit(responses: Record<string, string | Error>) {
	mockExecSync.mockImplementation((cmd: string) => {
		for (const [fragment, value] of Object.entries(responses)) {
			if (cmd.includes(fragment)) {
				if (value instanceof Error) throw value;
				return value;
			}
		}
		throw new Error(`unexpected git command: ${cmd}`);
	});
}

describe("collectCommitRefs", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("captures the branch and the HEAD commit with the message subject", () => {
		stubGit({
			"rev-parse --abbrev-ref HEAD": "feature\n",
			"rev-parse HEAD": "deadbeef\n",
		});

		const refs = collectCommitRefs("feat: add login\n\nbody text");

		expect(refs).toEqual([
			{
				kind: "branch",
				ref: "feature",
				url: "https://github.com/acme/widgets/tree/feature",
			},
			{
				kind: "commit",
				ref: "deadbeef",
				url: "https://github.com/acme/widgets/commit/deadbeef",
				title: "feat: add login",
			},
		]);
	});

	it("omits the branch on a detached HEAD", () => {
		stubGit({
			"rev-parse --abbrev-ref HEAD": "HEAD",
			"rev-parse HEAD": "deadbeef",
		});

		const refs = collectCommitRefs("fix: thing");

		expect(refs.map((r) => r.kind)).toEqual(["commit"]);
	});

	it("returns nothing when git reads fail", () => {
		stubGit({
			"rev-parse --abbrev-ref HEAD": new Error("not a repo"),
			"rev-parse HEAD": new Error("not a repo"),
		});

		expect(collectCommitRefs("fix: thing")).toEqual([]);
	});
});
