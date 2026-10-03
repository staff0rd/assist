import { execSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import { collectCommitRefs } from "./collectCommitRefs";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

vi.mock("../../shared/gitRefUrl", () => ({
	gitRefUrl: vi.fn(
		(kind: string, ref: string) =>
			`https://github.com/acme/widgets/${kind === "branch" ? "tree" : "commit"}/${ref}`,
	),
}));

const mockExecSync = vi.mocked(execSync);

function stubGit(responses: Record<string, string | Error>) {
	mockExecSync.mockImplementation((cmd) => {
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

	it("captures the branch, the HEAD commit with the message subject, and its parent", () => {
		stubGit({
			"rev-parse --abbrev-ref HEAD": "feature\n",
			"rev-parse HEAD^": "cafe1234\n",
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
			{ kind: "commit-parent", ref: "cafe1234" },
		]);
	});

	it("omits the parent for a root commit", () => {
		stubGit({
			"rev-parse --abbrev-ref HEAD": "feature\n",
			"rev-parse HEAD^": new Error("unknown revision"),
			"rev-parse HEAD": "deadbeef\n",
		});

		expect(collectCommitRefs("fix: thing").map((r) => r.kind)).toEqual([
			"branch",
			"commit",
		]);
	});

	it("omits the branch on a detached HEAD", () => {
		stubGit({
			"rev-parse --abbrev-ref HEAD": "HEAD",
			"rev-parse HEAD^": "cafe1234",
			"rev-parse HEAD": "deadbeef",
		});

		const refs = collectCommitRefs("fix: thing");

		expect(refs.map((r) => r.kind)).toEqual(["commit", "commit-parent"]);
	});

	it("returns nothing when git reads fail", () => {
		stubGit({
			"rev-parse --abbrev-ref HEAD": new Error("not a repo"),
			"rev-parse HEAD": new Error("not a repo"),
		});

		expect(collectCommitRefs("fix: thing")).toEqual([]);
	});
});
