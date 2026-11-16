import { execFileSync, execSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../shared/loadConfig";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockExecSync = vi.mocked(execSync);
const mockExecFileSync = vi.mocked(execFileSync);

vi.mock("./resolveDefaultBranch", () => ({
	resolveDefaultBranch: (override?: string) => override ?? "main",
}));

vi.mock("../../shared/resolveSessionItemId", () => ({
	resolveSessionItemId: () => null,
}));

vi.mock("../../shared/db/recordSessionRefs", () => ({
	recordSessionRefs: vi.fn(),
}));

import { createBranch } from "./createBranch";

function firstCallOrder(mock: { mock: { invocationCallOrder: number[] } }) {
	return mock.mock.invocationCallOrder[0];
}

describe("createBranch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(loadConfig).mockReturnValue(makeAssistConfig());
	});

	it("bases off the fresh remote default when --from is omitted", async () => {
		const result = await createBranch({ slug: "add-login-form" });

		expect(result).toEqual({
			branchName: "add-login-form",
			baseRef: "origin/main",
		});
		expect(mockExecSync).toHaveBeenCalledWith("git fetch", expect.anything());
		expect(mockExecFileSync).toHaveBeenCalledWith(
			"git",
			["switch", "-c", "add-login-form", "origin/main"],
			expect.anything(),
		);
	});

	it("bases off <ref> verbatim after validating it", async () => {
		const result = await createBranch({
			slug: "stacked-work",
			from: "feature/base",
		});

		expect(result).toEqual({
			branchName: "stacked-work",
			baseRef: "feature/base",
		});
		expect(mockExecSync).toHaveBeenCalledWith("git fetch", expect.anything());
		expect(mockExecFileSync).toHaveBeenCalledWith(
			"git",
			["rev-parse", "--verify", "feature/base"],
			expect.anything(),
		);
		expect(mockExecFileSync).toHaveBeenCalledWith(
			"git",
			["switch", "-c", "stacked-work", "feature/base"],
			expect.anything(),
		);
	});

	it("fetches before validating so remote refs are current", async () => {
		await createBranch({ slug: "stacked-work", from: "origin/some-branch" });

		expect(mockExecFileSync.mock.calls[0]).toEqual([
			"git",
			["rev-parse", "--verify", "origin/some-branch"],
			expect.anything(),
		]);
		expect(mockExecSync.mock.calls[0][0]).toBe("git fetch");
		expect(firstCallOrder(mockExecSync)).toBeLessThan(
			firstCallOrder(mockExecFileSync),
		);
	});

	it("throws a clear error and creates no branch when --from does not resolve", async () => {
		mockExecFileSync.mockImplementation(((_file: string, args: string[]) => {
			if (args[0] === "rev-parse") {
				throw new Error("fatal: Needed a single revision");
			}
			return "";
		}) as never);

		await expect(
			createBranch({ slug: "stacked-work", from: "nope" }),
		).rejects.toThrow('Ref "nope" does not resolve to a valid git ref');

		expect(mockExecFileSync).not.toHaveBeenCalledWith(
			"git",
			["switch", "-c", "stacked-work", "nope"],
			expect.anything(),
		);
	});
});
