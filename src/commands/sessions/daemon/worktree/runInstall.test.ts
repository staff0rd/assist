import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../../../test/mocks/childProcessMock";

type FakeChild = EventEmitter & { pid: number; stderr: EventEmitter };

let child: FakeChild;
let children: FakeChild[] = [];
const logs: string[] = [];

function fakeChild(pid: number): FakeChild {
	return Object.assign(new EventEmitter(), {
		pid,
		stderr: new EventEmitter(),
	});
}

const mockSpawn = vi.mocked(spawn);

const mockDetect = vi.fn((_dir: string): string | null => "npm install");

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

vi.mock("../daemonLog", () => ({
	daemonLog: (line: string) => logs.push(line),
}));

vi.mock("./resolveInstallCommand", () => ({
	resolveInstallCommand: () => "npm install",
}));

vi.mock("./detectInstallCommand", () => ({
	detectInstallCommand: (dir: string) => mockDetect(dir),
}));

import { runInstall } from "./runInstall";
import { stopInstall } from "./stopInstall";

function seed(worktreePath: string, onSeeded = () => {}): void {
	runInstall(worktreePath, "/home/me/git/assist", true, onSeeded);
}

function invocation(): {
	shell: string;
	args: string[];
	cwd: string;
	detached: boolean | undefined;
} {
	const [shell, args, options] = mockSpawn.mock.calls[0] as unknown as [
		string,
		string[],
		{ cwd: string; detached?: boolean },
	];
	return { shell, args, cwd: options.cwd, detached: options.detached };
}

function spyKill(): { killed: number[]; restore: () => void } {
	const killed: number[] = [];
	const kill = vi.spyOn(process, "kill").mockImplementation(((pid: number) => {
		killed.push(pid);
		return true;
	}) as typeof process.kill);
	return { killed, restore: () => kill.mockRestore() };
}

describe("runInstall", () => {
	beforeEach(() => {
		mockSpawn.mockClear();
		children = [];
		mockSpawn.mockImplementation(() => {
			child = fakeChild(4321 + children.length);
			children.push(child);
			return child as never;
		});
		mockDetect.mockReset();
		mockDetect.mockReturnValue("npm install");
		logs.length = 0;
	});

	afterEach(() => {
		for (const spawned of children) spawned.emit("close", 0, null);
	});

	it("cds into the worktree so a login shell profile cannot redirect the install", () => {
		seed("/home/me/git/assist-2");

		const { args, cwd } = invocation();
		expect(cwd).toBe("/home/me/git/assist-2");
		expect(args).toEqual([
			"-l",
			"-c",
			"cd '/home/me/git/assist-2' && npm install",
		]);
	});

	it("cds into the worktree on Windows paths", () => {
		seed(String.raw`C:\git\assist-2`);

		const { shell, args } = invocation();
		expect(shell).toBe("cmd.exe");
		expect(args).toEqual([
			"/c",
			String.raw`cd /d "C:\git\assist-2" && npm install`,
		]);
	});

	it("releases the held session once, however many times the install reports closing", () => {
		const onSeeded = vi.fn();

		seed("/home/me/git/assist-2", onSeeded);
		child.emit("close", 0, null);
		child.emit("close", 0, null);

		expect(onSeeded).toHaveBeenCalledTimes(1);
	});

	it("releases the held session when the install cannot start at all", () => {
		const onSeeded = vi.fn();

		seed("/home/me/git/assist-2", onSeeded);
		child.emit("error", new Error("spawn bash ENOENT"));

		expect(onSeeded).toHaveBeenCalledTimes(1);
	});

	it.runIf(process.platform !== "win32")(
		"tracks the install in its own process group so teardown can kill it",
		() => {
			const kill = spyKill();

			seed("/home/me/git/assist-2");
			stopInstall("/home/me/git/assist-2");

			expect(invocation().detached).toBe(true);
			expect(kill.killed).toEqual([-4321]);
			kill.restore();
		},
	);

	it("has nothing to kill once the install has finished", () => {
		const kill = vi.spyOn(process, "kill");

		seed("/home/me/git/assist-2");
		child.emit("close", 0, null);
		stopInstall("/home/me/git/assist-2");

		expect(kill).not.toHaveBeenCalled();
		kill.mockRestore();
	});

	describe("with a list of paths", () => {
		const tree = resolve("/home/me/git/assist-2");

		function seedPaths(paths: string[], onSeeded = () => {}): void {
			runInstall(tree, "/home/me/git/assist", paths, onSeeded);
		}

		function spawnedCwds(): string[] {
			return mockSpawn.mock.calls.map(
				(call) => (call[2] as { cwd: string }).cwd,
			);
		}

		it("installs sibling paths at the same time, releasing the session once all finish", () => {
			const onSeeded = vi.fn();

			seedPaths(["member-app", "coach-tools"], onSeeded);
			expect(spawnedCwds()).toEqual([
				resolve(tree, "member-app"),
				resolve(tree, "coach-tools"),
			]);
			children[1].emit("close", 0, null);
			expect(onSeeded).not.toHaveBeenCalled();
			children[0].emit("close", 0, null);

			expect(onSeeded).toHaveBeenCalledTimes(1);
			expect(logs).toContain(
				`worktree ${tree} installing deps in coach-tools: npm install`,
			);
			expect(logs).toContain(
				`worktree ${tree} install in coach-tools complete`,
			);
		});

		it("waits for an enclosing path before installing a path nested inside it", () => {
			const onSeeded = vi.fn();

			seedPaths([".", "packages/ui"], onSeeded);
			expect(spawnedCwds()).toEqual([tree]);
			children[0].emit("close", 0, null);
			expect(spawnedCwds()).toEqual([tree, resolve(tree, "packages/ui")]);
			expect(onSeeded).not.toHaveBeenCalled();
			children[1].emit("close", 0, null);

			expect(onSeeded).toHaveBeenCalledTimes(1);
		});

		it("reports the paths currently installing as each starts and finishes", () => {
			const onInstalling = vi.fn();

			runInstall(
				tree,
				"/home/me/git/assist",
				["a", "b"],
				() => {},
				onInstalling,
			);
			expect(onInstalling.mock.calls).toEqual([["a, b"]]);
			children[0].emit("close", 0, null);

			expect(onInstalling.mock.calls).toEqual([["a, b"], ["b"]]);
		});

		it("detects the package manager in each path", () => {
			mockDetect.mockImplementation((dir) =>
				dir.endsWith("ui") ? "pnpm install" : "npm install",
			);

			seedPaths(["api", "ui"]);

			const [, args, options] = mockSpawn.mock.calls[1] as unknown as [
				string,
				string[],
				{ cwd: string },
			];
			expect(options.cwd).toBe(resolve(tree, "ui"));
			expect(args.at(-1)).toMatch(/&& pnpm install$/);
		});

		it("skips the paths nested in one that failed, still releasing the session", () => {
			const onSeeded = vi.fn();

			seedPaths([".", "a", "b"], onSeeded);
			children[0].emit("close", 1, null);

			expect(spawnedCwds()).toEqual([tree]);
			expect(onSeeded).toHaveBeenCalledTimes(1);
			expect(logs).toContain(`worktree ${tree} install skipping a: . failed`);
			expect(logs).toContain(`worktree ${tree} install skipping b: . failed`);
		});

		it("keeps installing sibling paths when one fails", () => {
			const onSeeded = vi.fn();

			seedPaths(["a", "b"], onSeeded);
			children[0].emit("close", 1, null);
			expect(onSeeded).not.toHaveBeenCalled();
			children[1].emit("close", 0, null);

			expect(onSeeded).toHaveBeenCalledTimes(1);
			expect(logs).toContain(`worktree ${tree} install in b complete`);
		});

		it("skips a path with no package.json and installs the rest", () => {
			const onSeeded = vi.fn();
			mockDetect.mockImplementation((dir) =>
				dir.endsWith("missing") ? null : "npm install",
			);

			seedPaths(["missing", "b"], onSeeded);
			expect(spawnedCwds()).toEqual([resolve(tree, "b")]);
			children[0].emit("close", 0, null);

			expect(onSeeded).toHaveBeenCalledTimes(1);
			expect(logs).toContain(
				`worktree ${tree} install in missing failed: no package.json at ${resolve(tree, "missing")}`,
			);
		});

		it("releases the session when nothing can install", () => {
			const onSeeded = vi.fn();
			mockDetect.mockReturnValue(null);

			seedPaths(["a", "b"], onSeeded);

			expect(spawnedCwds()).toEqual([]);
			expect(onSeeded).toHaveBeenCalledTimes(1);
		});

		it.runIf(process.platform !== "win32")(
			"kills every running install at teardown and starts no further paths",
			() => {
				const onSeeded = vi.fn();
				const kill = spyKill();

				seedPaths(["a", "b", "b/nested"], onSeeded);
				stopInstall(tree);
				children[0].emit("close", null, "SIGKILL");
				children[1].emit("close", null, "SIGKILL");

				expect(kill.killed).toEqual([-4321, -4322]);
				expect(spawnedCwds()).toEqual([resolve(tree, "a"), resolve(tree, "b")]);
				expect(onSeeded).toHaveBeenCalledTimes(1);
				expect(logs).toContain(
					`worktree ${tree} install skipping b/nested: install stopped`,
				);
				kill.restore();
			},
		);
	});
});
