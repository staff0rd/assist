import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import { resolveDefaultBranch } from "./resolveDefaultBranch";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockExecFileSync = vi.mocked(execFileSync);

describe("resolveDefaultBranch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the config override without querying the remote", () => {
		expect(resolveDefaultBranch("develop")).toBe("develop");
		expect(mockExecFileSync).not.toHaveBeenCalled();
	});

	it("parses the branch from the remote HEAD symref", () => {
		mockExecFileSync.mockReturnValue(
			"ref: refs/heads/main\tHEAD\n5af2e82\tHEAD\n",
		);
		expect(resolveDefaultBranch()).toBe("main");
	});

	it("queries origin unless another remote is named", () => {
		mockExecFileSync.mockReturnValue("ref: refs/heads/main\tHEAD\n");

		resolveDefaultBranch();
		resolveDefaultBranch(undefined, undefined, "upstream");

		expect(mockExecFileSync.mock.calls.map(([, args]) => args)).toEqual([
			["ls-remote", "--symref", "origin", "HEAD"],
			["ls-remote", "--symref", "upstream", "HEAD"],
		]);
	});

	it("resolves a non-main default such as master", () => {
		mockExecFileSync.mockReturnValue("ref: refs/heads/master\tHEAD\n");
		expect(resolveDefaultBranch()).toBe("master");
	});

	it("falls back to main when the remote query fails", () => {
		mockExecFileSync.mockImplementation(() => {
			throw new Error("no network");
		});
		expect(resolveDefaultBranch()).toBe("main");
	});

	it("falls back to main when no symref line is present", () => {
		mockExecFileSync.mockReturnValue("5af2e82\tHEAD\n");
		expect(resolveDefaultBranch()).toBe("main");
	});
});
