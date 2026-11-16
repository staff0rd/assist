import { beforeEach, describe, expect, it, vi } from "vitest";
import { recordSessionRefs } from "../../shared/db/recordSessionRefs";
import type { AssistConfig } from "../../shared/types";
import { execCommit } from "./execCommit";
import { pushCommit } from "./pushCommit";

vi.mock("../../shared/db/recordSessionRefs", () => ({
	recordSessionRefs: vi.fn(),
}));
vi.mock("../../shared/resolveSessionItemId", () => ({
	resolveSessionItemId: () => 1715,
}));
vi.mock("../../shared/warnIfUnexpectedBranch", () => ({
	warnIfUnexpectedBranch: vi.fn(),
}));
vi.mock("./shouldPull", () => ({ shouldPull: () => false }));
vi.mock("./abortOnConflicts", () => ({ abortOnConflicts: vi.fn() }));
vi.mock("./refuseLockedDocs", () => ({ refuseLockedDocs: vi.fn() }));
vi.mock("./refuseLockedSchema", () => ({ refuseLockedSchema: vi.fn() }));
vi.mock("./commitStaged", () => ({ commitStaged: () => "65888b3" }));
vi.mock("./collectCommitRefs", () => ({
	collectCommitRefs: () => [{ kind: "commit", ref: "65888b3eb" }],
}));
vi.mock("./pushCommit", () => ({ pushCommit: vi.fn() }));

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
});
