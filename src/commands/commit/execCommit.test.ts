import { beforeEach, describe, expect, it, vi } from "vitest";
import { recordSessionRefs } from "../../shared/db/recordSessionRefs";
import type { AssistConfig } from "../../shared/types";
import { execCommit } from "./execCommit";
import { moveOffPlaceholder } from "./moveOffPlaceholder";
import { pushCommit } from "./pushCommit";
import { PushFailedError } from "./PushFailedError";
import { abortOnConflicts } from "./abortOnConflicts";
import { commitStaged } from "./commitStaged";
import { pullKeepingIndex } from "./pullKeepingIndex";
import { shouldPull } from "./shouldPull";

vi.mock("../../shared/db/recordSessionRefs", () => ({
	recordSessionRefs: vi.fn(),
}));
vi.mock("../../shared/resolveSessionItemId", () => ({
	resolveSessionItemId: () => 1715,
}));
vi.mock("../../shared/warnIfUnexpectedBranch", () => ({
	warnIfUnexpectedBranch: vi.fn(),
}));
vi.mock("./shouldPull", () => ({ shouldPull: vi.fn(() => false) }));
vi.mock("./pullKeepingIndex", () => ({ pullKeepingIndex: vi.fn() }));
vi.mock("./abortOnConflicts", () => ({ abortOnConflicts: vi.fn() }));
vi.mock("./refuseLockedDocs", () => ({ refuseLockedDocs: vi.fn() }));
vi.mock("./refuseLockedSchema", () => ({ refuseLockedSchema: vi.fn() }));
vi.mock("./commitStaged", () => ({ commitStaged: vi.fn(() => "65888b3") }));
vi.mock("./collectCommitRefs", () => ({
	collectCommitRefs: () => [{ kind: "commit", ref: "65888b3eb" }],
}));
vi.mock("./pushCommit", () => ({ pushCommit: vi.fn() }));
vi.mock("../../shared/tryGit", () => ({ tryGit: vi.fn(() => "a1b2c3d") }));
vi.mock("./moveOffPlaceholder", () => ({ moveOffPlaceholder: vi.fn() }));

const recordMock = vi.mocked(recordSessionRefs);
const pushMock = vi.mocked(pushCommit);
const config = { commit: { push: true } } as AssistConfig;

describe("execCommit", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation((() => {}) as never);
		recordMock.mockResolvedValue({ status: "recorded", itemId: 1715 });
	});

	it("records the commit on the item even when the push is rejected", async () => {
		pushMock.mockImplementation(() => {
			throw new Error("rejected");
		});

		await execCommit([], "fix: card layout", config);

		expect(recordMock).toHaveBeenCalledWith([
			{ kind: "commit", ref: "65888b3eb" },
		]);
		expect(process.exit).toHaveBeenCalledWith(1);
	});

	it("says the commit was not pushed when the push fails", async () => {
		pushMock.mockImplementation(() => {
			throw new PushFailedError("rebasing onto origin/main failed");
		});

		await execCommit([], "fix: card layout", config);

		expect(console.error).toHaveBeenCalledWith(
			"Committed a1b2c3d locally but NOT pushed: rebasing onto origin/main failed",
		);
		expect(process.exit).toHaveBeenCalledWith(1);
	});

	it("warns when the commit could not be recorded", async () => {
		recordMock.mockResolvedValue({
			status: "failed",
			itemId: 1715,
			error: new Error("db down"),
		});

		await execCommit([], "fix: card layout", config);

		expect(console.error).toHaveBeenCalledWith(
			"Warning: the commit was not recorded on item a1715: db down",
		);
	});

	it("moves off the worktree placeholder before committing", async () => {
		await execCommit([], "fix: card layout", config);

		expect(moveOffPlaceholder).toHaveBeenCalledWith("fix: card layout", config);
	});

	describe("while a merge is in progress", () => {
		const merging = { merging: true };

		it("concludes the merge with git's prepared message and pushes", async () => {
			pushMock.mockImplementation(() => {});

			await execCommit([], null, config, merging);

			expect(commitStaged).toHaveBeenCalledWith(null);
			expect(pushMock).toHaveBeenCalled();
			expect(process.exit).toHaveBeenCalledWith(0);
		});

		it("commits the merge with a given message", async () => {
			await execCommit([], "fix: merge main", config, merging);

			expect(commitStaged).toHaveBeenCalledWith("fix: merge main");
		});

		it("never pulls, even with commit.pull on", async () => {
			vi.mocked(shouldPull).mockReturnValue(true);

			await execCommit(
				[],
				null,
				{ commit: { pull: true } } as AssistConfig,
				merging,
			);

			expect(shouldPull).not.toHaveBeenCalled();
			expect(pullKeepingIndex).not.toHaveBeenCalled();
		});

		it("checks for unmerged paths", async () => {
			await execCommit([], null, config, merging);

			expect(abortOnConflicts).toHaveBeenCalledWith([], false, true);
		});

		it("does not move off the placeholder", async () => {
			await execCommit([], "fix: merge main", config, merging);

			expect(moveOffPlaceholder).not.toHaveBeenCalled();
		});
	});
});
