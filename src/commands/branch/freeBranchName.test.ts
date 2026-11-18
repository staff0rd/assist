import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import { freeBranchName } from "./freeBranchName";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockExecFileSync = vi.mocked(execFileSync);

function takenRefs(...refs: string[]) {
	mockExecFileSync.mockImplementation(((_file: string, args: string[]) => {
		if (!refs.includes(args[3])) throw new Error("missing");
		return "";
	}) as never);
}

describe("freeBranchName", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("keeps a name no branch uses", () => {
		takenRefs();

		expect(freeBranchName("card-layout")).toBe("card-layout");
	});

	it("suffixes a name taken by a local branch", () => {
		takenRefs("refs/heads/card-layout", "refs/heads/card-layout-2");

		expect(freeBranchName("card-layout")).toBe("card-layout-3");
	});

	it("suffixes a name taken only on the remote", () => {
		takenRefs("refs/remotes/origin/card-layout");

		expect(freeBranchName("card-layout")).toBe("card-layout-2");
	});
});
