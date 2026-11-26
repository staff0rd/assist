import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runInheritedCommand } from "./runInheritedCommand";
import { reviewInstance } from "./reviewInstance";
import { loadManualTesting } from "./steps/loadManualTesting";
import { runManualSteps } from "./steps/runManualSteps";
import type { StepVerdict } from "./steps/StepVerdict";

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
	ghPrView: () => ({ headRefOid: "0123456789abcdef", headRefName: "feat" }),
}));
vi.mock("./steps/loadManualTesting", () => ({ loadManualTesting: vi.fn() }));
vi.mock("./steps/runManualSteps", () => ({ runManualSteps: vi.fn() }));
vi.mock("./steps/instanceReportDir", () => ({
	instanceReportDir: () => "/reports/x",
}));
vi.mock("../resolveRepoRoot", () => ({ resolveRepoRoot: () => "/repo" }));
vi.mock("../../../shared/findFreePort", () => ({
	findFreePort: () => Promise.resolve(6000),
}));
vi.mock("./runInheritedCommand", () => ({ runInheritedCommand: vi.fn() }));

const run = vi.mocked(runInheritedCommand);
const runSteps = vi.mocked(runManualSteps);
const load = vi.mocked(loadManualTesting);

function verdict(value: StepVerdict["verdict"]): StepVerdict {
	return {
		step: 1,
		action: "Open /",
		expect: "Home shows",
		verdict: value,
		note: "Saw it",
		screenshot: "/reports/x/step-01.png",
	};
}

function commandsRun(): string[] {
	return run.mock.calls.map(([command, args]) =>
		[command, ...args.filter((arg) => !arg.startsWith("/"))].join(" "),
	);
}

beforeEach(() => {
	run.mockReset().mockResolvedValue();
	load.mockReset().mockReturnValue({
		setup: [],
		steps: [{ action: "Open /", expect: "Home shows" }],
	});
	runSteps.mockReset().mockResolvedValue({ verdicts: [verdict("pass")] });
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	process.exitCode = undefined;
	vi.restoreAllMocks();
});

describe("reviewInstance", () => {
	it("brings the PR up, runs the saved steps, then tears it down", async () => {
		await reviewInstance("7", {});
		expect(commandsRun()).toEqual([
			"git fetch origin pull/7/head",
			"git worktree add --detach 0123456789abcdef",
			expect.stringMatching(
				/^docker compose -p assist-review-app-pr7-\w+ -f up -d --wait$/,
			),
			expect.stringMatching(/^docker compose -p \S+ -f down -v$/),
			"git worktree remove --force",
		]);
		expect(runSteps).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "http://localhost:6000/",
				reportDir: "/reports/x",
			}),
		);
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining("Report: /reports/x/report.json"),
		);
		expect(process.exitCode).toBeUndefined();
	});

	it("runs the steps headed with --headed", async () => {
		await reviewInstance("7", { headed: true });
		expect(runSteps).toHaveBeenCalledWith(
			expect.objectContaining({ headed: true }),
		);
	});

	it("exits non-zero when a step fails", async () => {
		runSteps.mockResolvedValue({ verdicts: [verdict("fail")] });
		await reviewInstance("7", {});
		expect(commandsRun()).toContain("git worktree remove --force");
		expect(process.exitCode).toBe(1);
	});

	it("tears down and exits non-zero when the steps throw", async () => {
		runSteps.mockRejectedValue(new Error("browser crashed"));
		await reviewInstance("7", {});
		expect(commandsRun().at(-1)).toBe("git worktree remove --force");
		expect(console.error).toHaveBeenCalledWith("Error: browser crashed");
		expect(process.exitCode).toBe(1);
	});

	it("loads the saved steps before bringing anything up", async () => {
		load.mockImplementation(() => {
			throw new Error("exit");
		});
		await expect(reviewInstance("7", {})).rejects.toThrow("exit");
		expect(load).toHaveBeenCalledWith(
			expect.objectContaining({ fullName: "acme/app", headRef: "feat" }),
		);
		expect(run).not.toHaveBeenCalled();
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
