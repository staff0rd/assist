import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();
const mockGetInstallDir = vi.fn();
const mockIsGitRepo = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

vi.mock("../shared/getInstallDir", () => ({
	getInstallDir: () => mockGetInstallDir(),
	isGitRepo: (dir: string) => mockIsGitRepo(dir),
}));

import { update } from "./update";

describe("update", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetInstallDir.mockReturnValue("/some/dir");
	});

	it("should call assist sync without --yes for git repo install", async () => {
		mockIsGitRepo.mockReturnValue(true);

		await update();

		const syncCall = mockExecSync.mock.calls.find(
			(call: unknown[]) =>
				typeof call[0] === "string" && call[0].includes("assist sync"),
		);
		expect(syncCall).toBeDefined();
		expect(syncCall?.[0]).toBe("assist sync");
	});

	it("should call assist sync without --yes for npm install", async () => {
		mockIsGitRepo.mockReturnValue(false);
		mockExecSync.mockImplementation((cmd: string) => {
			if (cmd === "npm prefix -g") return Buffer.from("/some");
			return undefined;
		});

		await update();

		const syncCall = mockExecSync.mock.calls.find(
			(call: unknown[]) =>
				typeof call[0] === "string" && call[0].includes("assist sync"),
		);
		expect(syncCall).toBeDefined();
		expect(syncCall?.[0]).toBe("assist sync");
	});
});
