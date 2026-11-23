import { execFileSync, execSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../test/mocks/childProcessMock";

const mockExecSync = vi.mocked(execSync);
const mockExecFileSync = vi.mocked(execFileSync);
const mockGetInstallDir = vi.fn();
const mockIsGitRepo = vi.fn();
const mockIsDaemonRunning = vi.fn();
const mockRestartDaemon = vi.fn();

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

vi.mock("../shared/getInstallDir", () => ({
	getInstallDir: () => mockGetInstallDir(),
	isGitRepo: (dir: string) => mockIsGitRepo(dir),
}));

vi.mock("../shared/loadConfig", () => ({
	loadConfig: () => {
		throw new Error('Unrecognized key: "requireLinkedIssue"');
	},
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
		mockExecSync.mockImplementation((cmd) => {
			if (cmd === "npm prefix -g") return Buffer.from("/some");
			return undefined as never;
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

	describe("migrations", () => {
		const migrateCalls = () =>
			mockExecFileSync.mock.calls.filter(
				(call) =>
					Array.isArray(call[1]) && call[1].join(" ").includes("db migrate"),
			);
		const syncIndex = () =>
			mockExecSync.mock.calls.findIndex((call) => call[0] === "assist sync");

		beforeEach(() => {
			mockIsGitRepo.mockReturnValue(true);
			vi.spyOn(console, "log").mockImplementation(() => {});
			vi.spyOn(console, "error").mockImplementation(() => {});
		});

		it("applies pending migrations with the freshly built entry script, skipping the schema lock", async () => {
			const order: string[] = [];
			mockExecFileSync.mockImplementation(() => {
				order.push("migrate");
				return Buffer.from("");
			});
			mockExecSync.mockImplementation((cmd) => {
				order.push(String(cmd));
				return undefined as never;
			});

			await update();

			expect(migrateCalls()).toEqual([
				[
					process.execPath,
					[process.argv[1], "db", "migrate", "--after-update"],
					{ stdio: "inherit" },
				],
			]);
			expect(order.indexOf("migrate")).toBeGreaterThan(
				order.indexOf("npm run build"),
			);
			expect(order.indexOf("migrate")).toBeLessThan(
				order.indexOf("assist sync"),
			);
		});

		it("never loads config in the pre-update process, whose schema may not know newly pulled keys", async () => {
			await update();

			expect(migrateCalls()).toHaveLength(1);
			expect(syncIndex()).toBeGreaterThanOrEqual(0);
		});

		it("reports a failed migrate, points to assist db migrate, and still syncs and restarts the daemon", async () => {
			mockIsDaemonRunning.mockResolvedValue(true);
			mockExecFileSync.mockImplementation(() => {
				throw new Error("connection refused");
			});

			await update();

			const errors = vi
				.mocked(console.error)
				.mock.calls.map((call) => String(call[0]))
				.join("\n");
			expect(errors).toContain("connection refused");
			expect(errors).toContain("assist db migrate");
			expect(syncIndex()).toBeGreaterThanOrEqual(0);
			expect(mockRestartDaemon).toHaveBeenCalledOnce();
		});
	});
});
