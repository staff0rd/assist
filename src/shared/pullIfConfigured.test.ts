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

	it("skips the pull when the branch has no upstream", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ commit: { pull: true } }),
		);
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		mockExecSync.mockImplementation((command: string) => {
			if (command.includes("@{upstream}")) throw new Error("no upstream");
			return "";
		});

		pullIfConfigured();

		expect(mockExecSync).not.toHaveBeenCalledWith("git fetch", {
			stdio: "inherit",
		});
		expect(warnSpy).toHaveBeenCalled();
		expect(exitSpy).not.toHaveBeenCalled();
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
