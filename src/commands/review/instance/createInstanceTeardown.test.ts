import { describe, expect, it, vi } from "vitest";
import { createInstanceTeardown } from "./createInstanceTeardown";
import type { RunCommand } from "./runInheritedCommand";

const instance = {
	project: "assist-review-app-pr7-abc123",
	composeFile: "/repo/compose.yml",
	repoRoot: "/repo",
	checkouts: [
		{
			repo: "acme/api",
			repoRoot: "/repo",
			dir: "/instances/assist-review-app-pr7-abc123",
			sha: "abc",
			fetchRef: "pull/7/head",
			source: "PR #7",
			services: ["api"],
		},
		{
			repo: "acme/web",
			repoRoot: "/frontend",
			dir: "/instances/assist-review-app-pr7-abc123-frontend",
			sha: "def",
			fetchRef: "refs/heads/main",
			source: "default branch main",
			services: ["web"],
		},
	],
	env: { ASSIST_PORT_WEB: "6000" },
};

describe("createInstanceTeardown", () => {
	it("downs the project with volumes, then removes every worktree", async () => {
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
				["worktree", "remove", "--force", instance.checkouts[0].dir],
				{ cwd: "/repo" },
			],
			[
				"git",
				["worktree", "remove", "--force", instance.checkouts[1].dir],
				{ cwd: "/frontend" },
			],
		]);
	});

	it("still removes every worktree when an earlier step fails", async () => {
		const run = vi
			.fn<RunCommand>()
			.mockRejectedValueOnce(new Error("boom"))
			.mockRejectedValueOnce(new Error("locked"))
			.mockResolvedValue();
		vi.spyOn(console, "log").mockImplementation(() => {});
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		await createInstanceTeardown(instance, run)();
		expect(run).toHaveBeenCalledTimes(3);
		expect(error).toHaveBeenCalledWith("Warning: compose down failed: boom");
		expect(run.mock.calls[2][2]).toEqual({ cwd: "/frontend" });
	});

	it("runs once however often it is called", async () => {
		const run = vi.fn<RunCommand>().mockResolvedValue();
		vi.spyOn(console, "log").mockImplementation(() => {});
		const teardown = createInstanceTeardown(instance, run);
		await Promise.all([teardown(), teardown()]);
		await teardown();
		expect(run).toHaveBeenCalledTimes(3);
	});
});
