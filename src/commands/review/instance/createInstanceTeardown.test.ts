import { describe, expect, it, vi } from "vitest";
import { createInstanceTeardown } from "./createInstanceTeardown";
import type { RunCommand } from "./runInheritedCommand";

const instance = {
	project: "assist-review-app-pr7-abc123",
	composeFile: "/repo/compose.yml",
	repoRoot: "/repo",
	worktree: "/instances/assist-review-app-pr7-abc123",
	env: { ASSIST_PORT_WEB: "6000" },
};

describe("createInstanceTeardown", () => {
	it("downs the project with volumes, then removes the worktree", async () => {
		const run = vi.fn<RunCommand>().mockResolvedValue();
		vi.spyOn(console, "log").mockImplementation(() => {});
		await createInstanceTeardown(instance, run)();
		expect(run.mock.calls).toEqual([
			[
				"docker",
				[
					"compose",
					"-p",
					instance.project,
					"-f",
					instance.composeFile,
					"down",
					"-v",
				],
				{ cwd: "/repo", env: instance.env },
			],
			[
				"git",
				["worktree", "remove", "--force", instance.worktree],
				{ cwd: "/repo" },
			],
		]);
	});

	it("still removes the worktree when compose down fails", async () => {
		const run = vi
			.fn<RunCommand>()
			.mockRejectedValueOnce(new Error("boom"))
			.mockResolvedValue();
		vi.spyOn(console, "log").mockImplementation(() => {});
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		await createInstanceTeardown(instance, run)();
		expect(run).toHaveBeenCalledTimes(2);
		expect(error).toHaveBeenCalledWith("Warning: compose down failed: boom");
	});

	it("runs once however often it is called", async () => {
		const run = vi.fn<RunCommand>().mockResolvedValue();
		vi.spyOn(console, "log").mockImplementation(() => {});
		const teardown = createInstanceTeardown(instance, run);
		await Promise.all([teardown(), teardown()]);
		await teardown();
		expect(run).toHaveBeenCalledTimes(2);
	});
});
