import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runInheritedCommand } from "./runInheritedCommand";
import { reviewInstance } from "./reviewInstance";

vi.mock("../../../shared/loadConfig", () => ({
	loadConfig: () => ({
		review: {
			instance: {
				composeFile: "compose.yml",
				services: { web: { port: 3000 } },
				entry: { service: "web", path: "/" },
			},
		},
	}),
}));
vi.mock("../../prs/shared", () => ({
	getRepoInfo: () => ({ org: "acme", repo: "app" }),
}));
vi.mock("../highLevel/ghPrView", () => ({
	ghPrView: () => ({ headRefOid: "0123456789abcdef" }),
}));
vi.mock("../resolveRepoRoot", () => ({ resolveRepoRoot: () => "/repo" }));
vi.mock("../../../shared/findFreePort", () => ({
	findFreePort: () => Promise.resolve(6000),
}));
vi.mock("./runInheritedCommand", () => ({ runInheritedCommand: vi.fn() }));

const run = vi.mocked(runInheritedCommand);

function commandsRun(): string[] {
	return run.mock.calls.map(([command, args]) =>
		[command, ...args.filter((arg) => !arg.startsWith("/"))].join(" "),
	);
}

beforeEach(() => {
	run.mockReset().mockResolvedValue();
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	process.exitCode = undefined;
	vi.restoreAllMocks();
});

describe("reviewInstance", () => {
	it("brings the PR up, waits for Ctrl+C, then tears it down", async () => {
		const done = reviewInstance("7", {});
		await vi.waitFor(() =>
			expect(console.log).toHaveBeenCalledWith("Press Ctrl+C to tear it down."),
		);
		process.emit("SIGINT");
		await done;
		expect(commandsRun()).toEqual([
			"git fetch origin pull/7/head",
			"git worktree add --detach 0123456789abcdef",
			expect.stringMatching(
				/^docker compose -p assist-review-app-pr7-\w+ -f up -d --wait$/,
			),
			expect.stringMatching(/^docker compose -p \S+ -f down -v$/),
			"git worktree remove --force",
		]);
		expect(process.exitCode).toBeUndefined();
	});

	it("tears down and exits non-zero when bring-up fails", async () => {
		run.mockImplementation((_command, args) =>
			args.includes("up")
				? Promise.reject(new Error("unhealthy"))
				: Promise.resolve(),
		);
		await reviewInstance("7", {});
		expect(commandsRun().slice(-2)).toEqual([
			expect.stringMatching(/down -v$/),
			"git worktree remove --force",
		]);
		expect(process.exitCode).toBe(1);
	});

	it("leaves the instance up with --keep", async () => {
		await reviewInstance("7", { keep: true });
		expect(commandsRun().some((line) => line.includes("down"))).toBe(false);
		expect(commandsRun()).not.toContain("git worktree remove --force");
	});
});
