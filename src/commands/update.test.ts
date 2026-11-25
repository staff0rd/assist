import { execFileSync, execSync } from "node:child_process";
import { delimiter } from "node:path";
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

const mockRepoNode = vi.fn();
vi.mock("../shared/nodeRuntime/repoNode", () => ({
	repoNode: (dir: string) => mockRepoNode(dir),
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
		mockRepoNode.mockReturnValue(undefined);
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

	describe("install repo's pinned node", () => {
		const STEPS = [
			"pnpm install --frozen-lockfile",
			"npm run build",
			"assist sync",
		];
		const pathFor = (cmd: string) => {
			const call = mockExecSync.mock.calls.find((c) => c[0] === cmd);
			const env = (call?.[1] as { env?: NodeJS.ProcessEnv } | undefined)?.env;
			if (!env) return undefined;
			const key = Object.keys(env).find((k) => k.toUpperCase() === "PATH");
			return key ? env[key] : undefined;
		};

		beforeEach(() => {
			mockIsGitRepo.mockReturnValue(true);
			vi.spyOn(console, "log").mockImplementation(() => {});
			vi.spyOn(console, "warn").mockImplementation(() => {});
		});

		it("puts the pinned node's bin dir first on PATH for install, build and sync", async () => {
			mockRepoNode.mockReturnValue({
				pin: { file: "/some/dir/.node-version", spec: "v24" },
				ok: true,
				node: { path: "/n24/node", binDir: "/n24", version: "v24.1.0" },
			});

			await update();

			expect(mockRepoNode).toHaveBeenCalledWith("/some/dir");
			for (const step of STEPS)
				expect(pathFor(step)?.split(delimiter)[0]).toBe("/n24");
		});

		it("logs the unresolved pin and keeps the inherited PATH", async () => {
			mockRepoNode.mockReturnValue({
				pin: { file: "/some/dir/.node-version", spec: "v24" },
				ok: false,
				error: "no installed node matches",
			});

			await update();

			for (const step of STEPS) expect(pathFor(step)).toBe(process.env.PATH);
			expect(String(vi.mocked(console.warn).mock.calls[0]?.[0])).toContain(
				'/some/dir/.node-version wants node "v24" but no installed node matches',
			);
		});

		it("keeps the inherited PATH when the install dir has no pin", async () => {
			mockRepoNode.mockReturnValue(undefined);

			await update();

			for (const step of STEPS) expect(pathFor(step)).toBe(process.env.PATH);
		});
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
