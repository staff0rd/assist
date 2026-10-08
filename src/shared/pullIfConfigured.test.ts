import { execSync } from "node:child_process";
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

vi.mock("../commands/sessions/daemon/worktree/remoteDefaultBranch", () => ({
	remoteDefaultBranch: () => "main",
}));

const mockExecSync = vi.mocked(execSync);
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

	it("does nothing when commit.pull is disabled", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ commit: { pull: false } }),
		);

		pullIfConfigured();

		expect(mockExecSync).not.toHaveBeenCalled();
		expect(exitSpy).not.toHaveBeenCalled();
	});

	it("fetches then fast-forwards to upstream without git pull", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ commit: { pull: true } }),
		);
		mockExecSync.mockReturnValue("");

		pullIfConfigured();

		expect(mockExecSync).toHaveBeenCalledWith("git fetch", {
			stdio: "inherit",
		});
		expect(mockExecSync).toHaveBeenCalledWith("git merge --ff-only @{u}", {
			stdio: "inherit",
		});
		expect(mockExecSync).not.toHaveBeenCalledWith(
			expect.stringContaining("git pull"),
			expect.anything(),
		);
		expect(exitSpy).not.toHaveBeenCalled();
	});

	it("exits with code 1 when the fast-forward fails", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ commit: { pull: true } }),
		);
		mockExecSync.mockImplementation((command: string) => {
			if (command === "git merge --ff-only @{u}")
				throw new Error("not possible to fast-forward");
			return "";
		});

		expect(() => pullIfConfigured()).toThrow("process.exit");
		expect(exitSpy).toHaveBeenCalledWith(1);
	});

	describe("when the branch has no upstream", () => {
		function setup(failing: string[]) {
			mockLoadConfig.mockReturnValue(
				makeAssistConfig({ commit: { pull: true } }),
			);
			mockExecSync.mockImplementation((command: string) => {
				if (command.includes("@{upstream}")) throw new Error("no upstream");
				if (failing.some((prefix) => command.startsWith(prefix)))
					throw new Error("failed");
				return "";
			});
			return vi.spyOn(console, "warn").mockImplementation(() => {});
		}

		it("fetches and fast-forwards onto origin/<default> when HEAD is an ancestor", () => {
			const warnSpy = setup([]);

			pullIfConfigured();

			expect(mockExecSync).toHaveBeenCalledWith("git fetch", {
				stdio: "inherit",
			});
			expect(mockExecSync).toHaveBeenCalledWith(
				"git merge --ff-only origin/main",
				{ stdio: "inherit" },
			);
			expect(warnSpy).not.toHaveBeenCalled();
			expect(exitSpy).not.toHaveBeenCalled();
		});

		it("skips when the branch has commits of its own", () => {
			const warnSpy = setup(["git merge-base --is-ancestor"]);

			pullIfConfigured();

			expect(mockExecSync).not.toHaveBeenCalledWith(
				expect.stringContaining("git merge --ff-only"),
				expect.anything(),
			);
			expect(warnSpy).toHaveBeenCalledWith(
				expect.stringContaining("commits of its own"),
			);
			expect(exitSpy).not.toHaveBeenCalled();
		});

		it("skips when there is no origin/<default>", () => {
			const warnSpy = setup(["git rev-parse --verify"]);

			pullIfConfigured();

			expect(mockExecSync).not.toHaveBeenCalledWith(
				expect.stringContaining("git merge"),
				expect.anything(),
			);
			expect(warnSpy).toHaveBeenCalledWith(
				expect.stringContaining("there is no origin/main"),
			);
			expect(exitSpy).not.toHaveBeenCalled();
		});
	});

	it("skips the pull when the working copy has local changes", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ commit: { pull: true } }),
		);
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		mockExecSync.mockImplementation((command: string) =>
			command === "git status --porcelain" ? " M src/foo.ts\n" : "",
		);

		pullIfConfigured();

		expect(mockExecSync).not.toHaveBeenCalledWith("git fetch", {
			stdio: "inherit",
		});
		expect(warnSpy).toHaveBeenCalled();
		expect(exitSpy).not.toHaveBeenCalled();
	});
});
