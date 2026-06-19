import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();
const mockGetInstallDir = vi.fn();
const mockIsGitRepo = vi.fn();
const mockIsDaemonRunning = vi.fn();
const mockRestartDaemon = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

vi.mock("../shared/getInstallDir", () => ({
	getInstallDir: () => mockGetInstallDir(),
	isGitRepo: (dir: string) => mockIsGitRepo(dir),
}));

vi.mock("./sessions/daemon/connectToDaemon", () => ({
	isDaemonRunning: () => mockIsDaemonRunning(),
}));

vi.mock("./sessions/daemon/restartDaemon", () => ({
	restartDaemon: () => mockRestartDaemon(),
}));

import { update } from "./update";

describe("update", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetInstallDir.mockReturnValue("/some/dir");
		mockIsDaemonRunning.mockResolvedValue(false);
		mockRestartDaemon.mockResolvedValue(undefined);
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

	describe("sessions daemon", () => {
		it("should restart the daemon when it is running", async () => {
			mockIsGitRepo.mockReturnValue(true);
			mockIsDaemonRunning.mockResolvedValue(true);

			await update();

			expect(mockRestartDaemon).toHaveBeenCalledOnce();
		});

		it("should not restart the daemon when it is not running", async () => {
			mockIsGitRepo.mockReturnValue(true);
			mockIsDaemonRunning.mockResolvedValue(false);

			await update();

			expect(mockRestartDaemon).not.toHaveBeenCalled();
		});

		it("should exit non-zero when the restart fails", async () => {
			mockIsGitRepo.mockReturnValue(true);
			mockIsDaemonRunning.mockResolvedValue(true);
			mockRestartDaemon.mockRejectedValue(new Error("boom"));
			const exitError = new Error("process.exit");
			const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
				throw exitError;
			});
			vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(update()).rejects.toThrow(exitError);
			expect(exitSpy).toHaveBeenCalledWith(1);

			exitSpy.mockRestore();
		});
	});
});
