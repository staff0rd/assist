import { execFile, execSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../test/mocks/childProcessMock";
import type * as loadConfigMockModule from "../test/mocks/loadConfigMock";
import { makeAssistConfig } from "../test/mothers/makeAssistConfig";
import { loadConfig } from "./loadConfig";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

vi.mock("./loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockExecSync = vi.mocked(execSync);
const mockExecFile = vi.mocked(execFile);
const mockLoadConfig = vi.mocked(loadConfig);

import { pullIfConfigured } from "./pullIfConfigured";

describe("pullIfConfigured", () => {
	let exitSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit");
		}) as never);
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("does nothing when commit.pull is disabled", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ commit: { pull: false } }),
		);

		await pullIfConfigured();

		expect(mockExecSync).not.toHaveBeenCalled();
		expect(exitSpy).not.toHaveBeenCalled();
	});

	it("fetches then fast-forwards to upstream without git pull", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ commit: { pull: true } }),
		);
		mockExecSync.mockReturnValue("");

		await pullIfConfigured();

		expect(mockExecSync).toHaveBeenCalledWith("git fetch", {
			stdio: "inherit",
		});
		expect(mockExecSync).toHaveBeenCalledWith("git merge --ff-only @{u}", {
			stdio: ["inherit", "inherit", "pipe"],
		});
		expect(mockExecSync).not.toHaveBeenCalledWith(
			expect.stringContaining("git pull"),
			expect.anything(),
		);
		expect(exitSpy).not.toHaveBeenCalled();
	});

	it("exits with code 1 when the fast-forward fails", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ commit: { pull: true } }),
		);
		mockExecSync.mockImplementation((command: string) => {
			if (command === "git merge --ff-only @{u}")
				throw new Error("not possible to fast-forward");
			return "";
		});

		await expect(pullIfConfigured()).rejects.toThrow("process.exit");
		expect(exitSpy).toHaveBeenCalledWith(1);
	});

	it("retries the fast-forward when another git process holds index.lock", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ commit: { pull: true } }),
		);
		vi.spyOn(console, "warn").mockImplementation(() => {});
		vi.spyOn(process.stderr, "write").mockImplementation(() => true);
		let merges = 0;
		mockExecSync.mockImplementation((command: string) => {
			if (command === "git merge --ff-only @{u}" && ++merges === 1)
				throw Object.assign(new Error("merge failed"), {
					stderr: "fatal: Unable to create '.git/index.lock': File exists.",
				});
			return "";
		});

		await pullIfConfigured();

		expect(merges).toBe(2);
		expect(exitSpy).not.toHaveBeenCalled();
	});

	describe("when the branch has no upstream", () => {
		function setup(failing: string[]) {
			mockLoadConfig.mockReturnValue(
				makeAssistConfig({ commit: { pull: true } }),
			);
			mockExecFile.mockImplementation(((
				_file: string,
				args: string[],
				_options: unknown,
				callback: (error: Error | null, stdout: string) => void,
			) => {
				if (args.includes("refs/remotes/origin/HEAD"))
					setImmediate(() => callback(null, "origin/trunk\n"));
				else setImmediate(() => callback(new Error("unexpected"), ""));
			}) as never);
			mockExecSync.mockImplementation((command: string) => {
				if (command.includes("@{upstream}")) throw new Error("no upstream");
				if (failing.some((prefix) => command.startsWith(prefix)))
					throw new Error("failed");
				return "";
			});
			return vi.spyOn(console, "warn").mockImplementation(() => {});
		}

		it("fetches and fast-forwards onto origin/<default> when HEAD is an ancestor", async () => {
			const warnSpy = setup([]);

			await pullIfConfigured();

			expect(mockExecSync).toHaveBeenCalledWith("git fetch", {
				stdio: "inherit",
			});
			expect(mockExecSync).toHaveBeenCalledWith(
				"git merge --ff-only origin/trunk",
				{ stdio: ["inherit", "inherit", "pipe"] },
			);
			expect(warnSpy).not.toHaveBeenCalled();
			expect(exitSpy).not.toHaveBeenCalled();
		});

		it("skips when the branch has commits of its own", async () => {
			const warnSpy = setup(["git merge-base --is-ancestor"]);

			await pullIfConfigured();

			expect(mockExecSync).not.toHaveBeenCalledWith(
				expect.stringContaining("git merge --ff-only"),
				expect.anything(),
			);
			expect(warnSpy).toHaveBeenCalledWith(
				expect.stringContaining("commits of its own not on origin/trunk"),
			);
			expect(exitSpy).not.toHaveBeenCalled();
		});

		it("skips when there is no origin/<default>", async () => {
			const warnSpy = setup(["git rev-parse --verify"]);

			await pullIfConfigured();

			expect(mockExecSync).not.toHaveBeenCalledWith(
				expect.stringContaining("git merge"),
				expect.anything(),
			);
			expect(warnSpy).toHaveBeenCalledWith(
				expect.stringContaining("there is no origin/trunk"),
			);
			expect(exitSpy).not.toHaveBeenCalled();
		});
	});

	it("skips the pull when the working copy has local changes", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ commit: { pull: true } }),
		);
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		mockExecSync.mockImplementation((command: string) =>
			command === "git status --porcelain" ? " M src/foo.ts\n" : "",
		);

		await pullIfConfigured();

		expect(mockExecSync).not.toHaveBeenCalledWith("git fetch", {
			stdio: "inherit",
		});
		expect(warnSpy).toHaveBeenCalled();
		expect(exitSpy).not.toHaveBeenCalled();
	});
});
