import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../../../test/mocks/fsMock";
import { fetchQuietly } from "../../../watch/fetchQuietly";
import { daemonLog } from "../daemonLog";
import { createWorktree } from "./createWorktree";
import { gitSync, gitSyncOrNull } from "./git";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../../test/mocks/fsMock")
	).fsMock(),
);
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./git", () => ({ gitSync: vi.fn(() => ""), gitSyncOrNull: vi.fn() }));
vi.mock("./listWorktreePaths", () => ({
	listWorktreePaths: () => ["/git/repo"],
	listLocalBranches: () => ["main"],
}));
vi.mock("../../../watch/fetchQuietly", () => ({ fetchQuietly: vi.fn() }));
vi.mock("./readWorktreeRegistry", () => ({ recordWorktree: vi.fn() }));
vi.mock("../../../backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: () => "github.com/acme/repo",
}));

const gitSyncMock = vi.mocked(gitSync);
const gitSyncOrNullMock = vi.mocked(gitSyncOrNull);

function gitState({ head = "main", verify = true } = {}) {
	gitSyncOrNullMock.mockImplementation((_cwd: string, args: string[]) => {
		if (args[0] === "rev-parse") return verify ? "abc1234" : null;
		if (args[2] === "refs/remotes/origin/HEAD") return "origin/main";
		return head;
	});
}

function worktreeAdd(): string[] | undefined {
	return gitSyncMock.mock.calls
		.map((call) => call[1])
		.find((args) => args[0] === "worktree");
}

describe("createWorktree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(existsSync).mockReturnValue(false);
		gitState();
	});

	describe("with trunk-based off (the default)", () => {
		it("starts the worktree branch off the remote default with no tracking", () => {
			expect(
				createWorktree(
					"/git/repo",
					{ root: undefined, trunk: false },
					new Set(),
				),
			).toBe("/git/repo-2");

			expect(worktreeAdd()).toEqual([
				"worktree",
				"add",
				"--no-track",
				"-b",
				"repo-2",
				"/git/repo-2",
				"origin/main",
			]);
		});
	});

	describe("with trunk-based on", () => {
		it("tracks the mainline so commits land there", () => {
			createWorktree("/git/repo", { root: undefined, trunk: true }, new Set());

			expect(worktreeAdd()).toEqual([
				"worktree",
				"add",
				"--track",
				"-b",
				"repo-2",
				"/git/repo-2",
				"origin/main",
			]);
		});
	});

	it("never mutates the clone's shared push configuration", () => {
		createWorktree("/git/repo", { root: undefined, trunk: true }, new Set());

		expect(gitSyncMock.mock.calls.map((call) => call[1][0])).not.toContain(
			"config",
		);
	});

	describe("with a preferred path", () => {
		it("reclaims it when nothing holds it", () => {
			expect(
				createWorktree(
					"/git/repo",
					{ root: undefined, trunk: false },
					new Set(),
					"/git/repo-7",
				),
			).toBe("/git/repo-7");

			expect(worktreeAdd()).toEqual([
				"worktree",
				"add",
				"--no-track",
				"-b",
				"repo-7",
				"/git/repo-7",
				"origin/main",
			]);
		});

		it("falls back to the next free suffix when it is already held", () => {
			expect(
				createWorktree(
					"/git/repo",
					{ root: undefined, trunk: false },
					new Set(["/git/repo-7"]),
					"/git/repo-7",
				),
			).toBe("/git/repo-2");
		});
	});

	it("falls back to the clone's HEAD when the remote branch is unknown", () => {
		gitState({ verify: false });

		createWorktree("/git/repo", { root: undefined, trunk: true }, new Set());

		expect(worktreeAdd()).toEqual([
			"worktree",
			"add",
			"--no-track",
			"-b",
			"repo-2",
			"/git/repo-2",
			"HEAD",
		]);
	});

	it("fetches before resolving the start point", () => {
		createWorktree("/git/repo", { root: undefined, trunk: false }, new Set());

		expect(fetchQuietly).toHaveBeenCalledWith("/git/repo", 0);
		const fetchOrder = vi.mocked(fetchQuietly).mock.invocationCallOrder[0];
		const verifyOrder = gitSyncOrNullMock.mock.invocationCallOrder[0];
		expect(fetchOrder).toBeLessThan(verifyOrder ?? Infinity);
	});

	it("logs a failed fetch and still creates the worktree off local refs", () => {
		vi.mocked(fetchQuietly).mockReturnValueOnce("could not resolve host");

		expect(
			createWorktree("/git/repo", { root: undefined, trunk: false }, new Set()),
		).toBe("/git/repo-2");
		expect(daemonLog).toHaveBeenCalledWith(
			expect.stringContaining("could not resolve host"),
		);
		expect(worktreeAdd()).toBeDefined();
	});
});
