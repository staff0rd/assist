import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockExecFileSync = vi.mocked(execFileSync);

import { waitForUpstream } from "./waitForUpstream";

type GitState = {
	head: string;
	upstreamSha: string;
	behind: number;
	fetches: number;
	repo: boolean;
	branch: string | undefined;
	upstream: string | undefined;
	onFetch?: (state: GitState) => void;
};

let git: GitState;

const sentinelDir = mkdtempSync(join(tmpdir(), "watch-sentinel-"));
const sentinel = join(sentinelDir, "assist-simulate-divergence");

afterAll(() => rmSync(sentinelDir, { recursive: true, force: true }));

function installGit(overrides: Partial<GitState> = {}): void {
	git = {
		head: "aaa1111",
		upstreamSha: "aaa1111",
		behind: 0,
		fetches: 0,
		repo: true,
		branch: "assist-3",
		upstream: "origin/assist-3",
		...overrides,
	};

	mockExecFileSync.mockImplementation((_cmd, args) => {
		const key = (args ?? []).join(" ");
		if (key === "rev-parse --is-inside-work-tree") {
			if (!git.repo) throw new Error("not a repository");
			return "true\n";
		}
		if (key === "symbolic-ref --quiet --short HEAD") {
			if (!git.branch) throw new Error("detached");
			return `${git.branch}\n`;
		}
		if (key === "rev-parse --abbrev-ref --symbolic-full-name @{u}") {
			if (!git.upstream) throw new Error("no upstream");
			return `${git.upstream}\n`;
		}
		if (key === "rev-parse @") return `${git.head}\n`;
		if (key === "rev-parse @{u}") return `${git.upstreamSha}\n`;
		if (key === "rev-list --count @..@{u}") return `${git.behind}\n`;
		if (key === "rev-parse --git-path assist-simulate-divergence")
			return `${sentinel}\n`;
		if (key === "fetch --quiet") {
			git.fetches += 1;
			git.onFetch?.(git);
			return "";
		}
		throw new Error(`unexpected git ${key}`);
	});
}

const wait = () =>
	waitForUpstream({ intervalMs: 30_000, timeoutMs: 300_000, timeout: "5m" });

describe("waitForUpstream", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		installGit();
	});

	afterEach(() => {
		vi.useRealTimers();
		rmSync(sentinel, { force: true });
	});

	it("resolves a simulated divergence at startup and consumes the request", async () => {
		writeFileSync(sentinel, "");

		await expect(wait()).resolves.toEqual({
			kind: "simulated-divergence",
			upstream: "origin/assist-3",
		});
		expect(existsSync(sentinel)).toBe(false);
		expect(git.fetches).toBe(0);
	});

	it("resolves a simulated divergence requested while polling on the next tick", async () => {
		const pending = wait();
		writeFileSync(sentinel, "");
		await vi.advanceTimersByTimeAsync(30_000);

		await expect(pending).resolves.toEqual({
			kind: "simulated-divergence",
			upstream: "origin/assist-3",
		});
		expect(existsSync(sentinel)).toBe(false);
	});

	it("resolves moved on the first check when the upstream is already ahead", async () => {
		installGit({ upstreamSha: "bbb2222", behind: 2 });

		await expect(wait()).resolves.toEqual({
			kind: "moved",
			upstream: "origin/assist-3",
			from: "aaa1111",
			to: "bbb2222",
			count: 2,
		});
	});

	it("fetches before the first check, so commits only on the remote are seen at startup", async () => {
		installGit({
			onFetch: (state) => {
				state.upstreamSha = "bbb2222";
				state.behind = 2;
			},
		});

		await expect(wait()).resolves.toMatchObject({ kind: "moved", count: 2 });
		expect(git.fetches).toBe(1);
	});

	it("fetches on the interval and resolves once the upstream gains commits", async () => {
		installGit({
			onFetch: (state) => {
				if (state.fetches < 3) return;
				state.upstreamSha = "ccc3333";
				state.behind = 3;
			},
		});

		const pending = wait();
		expect(git.fetches).toBe(1);
		await vi.advanceTimersByTimeAsync(30_000);
		expect(git.fetches).toBe(2);
		await vi.advanceTimersByTimeAsync(30_000);

		await expect(pending).resolves.toEqual({
			kind: "moved",
			upstream: "origin/assist-3",
			from: "aaa1111",
			to: "ccc3333",
			count: 3,
		});
	});

	it("keeps waiting when a fetch fails", async () => {
		installGit({
			onFetch: (state) => {
				if (state.fetches <= 2) throw new Error("network unreachable");
				state.upstreamSha = "ddd4444";
				state.behind = 1;
			},
		});

		const pending = wait();
		await vi.advanceTimersByTimeAsync(60_000);

		await expect(pending).resolves.toMatchObject({ kind: "moved", count: 1 });
	});

	it("resolves timeout when the branch never moves", async () => {
		const pending = wait();
		await vi.advanceTimersByTimeAsync(300_000);

		await expect(pending).resolves.toEqual({
			kind: "timeout",
			upstream: "origin/assist-3",
			timeout: "5m",
		});
	});

	it("never times out when no timeout is given", async () => {
		let settled = false;
		const pending = waitForUpstream({
			intervalMs: 30_000,
			timeoutMs: undefined,
			timeout: "none",
		}).then((outcome) => {
			settled = true;
			return outcome;
		});

		await vi.advanceTimersByTimeAsync(24 * 60 * 60_000);
		expect(settled).toBe(false);

		git.upstreamSha = "eee5555";
		git.behind = 1;
		await vi.advanceTimersByTimeAsync(30_000);

		await expect(pending).resolves.toMatchObject({ kind: "moved", count: 1 });
	});

	it("resolves interrupted on SIGINT and stops fetching", async () => {
		const before = process.listenerCount("SIGINT");
		const pending = wait();
		await vi.advanceTimersByTimeAsync(30_000);

		process.emit("SIGINT");

		await expect(pending).resolves.toEqual({ kind: "interrupted" });
		expect(process.listenerCount("SIGINT")).toBe(before);

		await vi.advanceTimersByTimeAsync(120_000);
		expect(git.fetches).toBe(2);
	});

	it("reports unavailable outside a git repository", async () => {
		installGit({ repo: false });

		await expect(wait()).resolves.toEqual({
			kind: "unavailable",
			reason: "not a git repository — run assist watch wait from inside a repo",
		});
	});

	it("reports unavailable on detached HEAD", async () => {
		installGit({ branch: undefined });

		await expect(wait()).resolves.toMatchObject({
			kind: "unavailable",
			reason: expect.stringContaining("HEAD is detached"),
		});
	});

	it("reports unavailable with a push hint when the branch has no upstream", async () => {
		installGit({ upstream: undefined });

		await expect(wait()).resolves.toEqual({
			kind: "unavailable",
			reason:
				'branch "assist-3" has no upstream — set one with: git push -u origin assist-3',
		});
	});
});
