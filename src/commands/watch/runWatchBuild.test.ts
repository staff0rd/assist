import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { RunConfig } from "../../shared/types";

const baseDir = mkdtempSync(join(tmpdir(), "watch-build-"));
mkdirSync(join(baseDir, "packages", "api"), { recursive: true });

const mockFindRunConfig = vi.fn();
const mockRunCommandToCompletion = vi.fn();
const mockRunPreCommands = vi.fn();

vi.mock("../run/findRunConfig", () => ({
	findRunConfig: (name: string) => mockFindRunConfig(name),
}));

vi.mock("../run/runCommandToCompletion", () => ({
	runCommandToCompletion: (...args: unknown[]) =>
		mockRunCommandToCompletion(...args),
}));

vi.mock("../run/runPreCommands", () => ({
	runPreCommands: (...args: unknown[]) => mockRunPreCommands(...args),
}));

vi.mock("../../shared/runConfigBaseDir", () => ({
	runConfigBaseDir: () => baseDir,
	runConfigBaseDirFrom: () => baseDir,
}));

import { runWatchBuild } from "./runWatchBuild";

const autoBuild: RunConfig = {
	name: "auto-build",
	command: "bash",
	args: ["-c", "npm i && npm run build"],
};

beforeEach(() => {
	vi.clearAllMocks();
	mockFindRunConfig.mockReturnValue(autoBuild);
});

afterAll(() => {
	rmSync(baseDir, { recursive: true, force: true });
});

describe("runWatchBuild", () => {
	it("runs the resolved run entry quietly and reports success", async () => {
		mockRunCommandToCompletion.mockResolvedValue({
			kind: "completed",
			exitCode: 0,
			output: "",
		});

		await expect(runWatchBuild("auto-build")).resolves.toEqual({
			kind: "built",
		});
		expect(mockFindRunConfig).toHaveBeenCalledWith("auto-build");
		expect(mockRunCommandToCompletion).toHaveBeenCalledWith(
			"bash",
			["-c", "npm i && npm run build"],
			undefined,
			undefined,
			true,
		);
	});

	it("carries the exit code and output of a failing build", async () => {
		mockRunCommandToCompletion.mockResolvedValue({
			kind: "completed",
			exitCode: 2,
			output: "tsc: error TS2345",
		});

		await expect(runWatchBuild("auto-build")).resolves.toEqual({
			kind: "failed",
			exitCode: 2,
			output: "tsc: error TS2345",
		});
	});

	it("reports a command that could not be spawned as a failure", async () => {
		mockRunCommandToCompletion.mockResolvedValue({
			kind: "failed",
			message: "Failed to execute command: spawn bash ENOENT",
		});

		await expect(runWatchBuild("auto-build")).resolves.toEqual({
			kind: "failed",
			exitCode: 1,
			output: "Failed to execute command: spawn bash ENOENT",
		});
	});

	it("runs pre-commands in the entry's cwd first", async () => {
		mockFindRunConfig.mockReturnValue({
			...autoBuild,
			cwd: "packages/api",
			pre: ["npm ci"],
		});
		mockRunCommandToCompletion.mockResolvedValue({
			kind: "completed",
			exitCode: 0,
			output: "",
		});

		await runWatchBuild("auto-build");

		expect(mockRunPreCommands).toHaveBeenCalledWith(
			["npm ci"],
			join(baseDir, "packages", "api"),
			true,
		);
	});

	it("fails by naming the run config and missing cwd without spawning", async () => {
		mockFindRunConfig.mockReturnValue({ ...autoBuild, cwd: "packages/gone" });

		await expect(runWatchBuild("auto-build")).resolves.toEqual({
			kind: "failed",
			exitCode: 1,
			output: `run config "auto-build": cwd ${join(baseDir, "packages", "gone")} does not exist`,
		});
		expect(mockRunCommandToCompletion).not.toHaveBeenCalled();
	});
});
