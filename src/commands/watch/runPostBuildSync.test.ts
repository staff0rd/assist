import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRunCommandToCompletion = vi.fn();

vi.mock("../run/runCommandToCompletion", () => ({
	runCommandToCompletion: (...args: unknown[]) =>
		mockRunCommandToCompletion(...args),
}));

import { runPostBuildSync } from "./runPostBuildSync";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("runPostBuildSync", () => {
	it("shells out to the freshly built assist sync and reports success", async () => {
		mockRunCommandToCompletion.mockResolvedValue({
			kind: "completed",
			exitCode: 0,
			output: "",
		});

		await expect(runPostBuildSync()).resolves.toEqual({ kind: "built" });
		expect(mockRunCommandToCompletion).toHaveBeenCalledWith(
			"assist",
			["sync", "--yes"],
			undefined,
			undefined,
			true,
		);
	});

	it("carries the exit code and output of a failing sync", async () => {
		mockRunCommandToCompletion.mockResolvedValue({
			kind: "completed",
			exitCode: 2,
			output: "EACCES: permission denied",
		});

		await expect(runPostBuildSync()).resolves.toEqual({
			kind: "failed",
			exitCode: 2,
			output: "EACCES: permission denied",
		});
	});

	it("reports a sync that could not be spawned as a failure", async () => {
		mockRunCommandToCompletion.mockResolvedValue({
			kind: "failed",
			message: "Failed to execute command: spawn assist ENOENT",
		});

		await expect(runPostBuildSync()).resolves.toEqual({
			kind: "failed",
			exitCode: 1,
			output: "Failed to execute command: spawn assist ENOENT",
		});
	});
});
