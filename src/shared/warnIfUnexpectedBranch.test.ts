import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AssistConfig } from "./types";

const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

import { warnIfUnexpectedBranch } from "./warnIfUnexpectedBranch";

function configWithExpected(expectedBranch?: string): AssistConfig {
	return { commit: { expectedBranch } } as unknown as AssistConfig;
}

describe("warnIfUnexpectedBranch", () => {
	let warnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("when commit.expectedBranch is unset", () => {
		it("should not check the branch or warn", () => {
			warnIfUnexpectedBranch(configWithExpected(undefined));

			expect(mockExecSync).not.toHaveBeenCalled();
			expect(warnSpy).not.toHaveBeenCalled();
		});
	});

	describe("when HEAD is on the expected branch", () => {
		it("should not warn", () => {
			mockExecSync.mockReturnValue("main\n");

			warnIfUnexpectedBranch(configWithExpected("main"));

			expect(warnSpy).not.toHaveBeenCalled();
		});
	});

	describe("when HEAD is on a different branch", () => {
		it("should emit a warning naming both branches", () => {
			mockExecSync.mockReturnValue("stray-branch\n");

			warnIfUnexpectedBranch(configWithExpected("main"));

			expect(warnSpy).toHaveBeenCalledTimes(1);
			const message = String(warnSpy.mock.calls[0][0]);
			expect(message).toContain("stray-branch");
			expect(message).toContain("main");
		});
	});

	describe("when the current branch cannot be resolved", () => {
		it("should not warn", () => {
			mockExecSync.mockImplementation(() => {
				throw new Error("not a git repo");
			});

			warnIfUnexpectedBranch(configWithExpected("main"));

			expect(warnSpy).not.toHaveBeenCalled();
		});
	});
});
