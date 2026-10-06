import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../../../test/mocks/childProcessMock";

type FakeChild = EventEmitter & { pid: number; stderr: EventEmitter };

let child: FakeChild;
const logs: string[] = [];

function fakeChild(): FakeChild {
	return Object.assign(new EventEmitter(), {
		pid: 4321,
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

describe("runInstall", () => {
	beforeEach(() => {
		mockSpawn.mockClear();
		mockSpawn.mockImplementation(() => {
			child = fakeChild();
			return child as never;
		});
		mockDetect.mockReset();
		mockDetect.mockReturnValue("npm install");
		logs.length = 0;
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
			const killed: [number, NodeJS.Signals][] = [];
			const kill = vi.spyOn(process, "kill").mockImplementation(((
				pid: number,
				signal: NodeJS.Signals,
			) => {
				killed.push([pid, signal]);
				return true;
			}) as typeof process.kill);

			seed("/home/me/git/assist-2");
			stopInstall("/home/me/git/assist-2");

			expect(invocation().detached).toBe(true);
			expect(killed).toEqual([[-4321, "SIGKILL"]]);
			kill.mockRestore();
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

		it("installs in each path in order, one at a time", () => {
			const onSeeded = vi.fn();

			seedPaths([".", "packages/ui"], onSeeded);
			expect(spawnedCwds()).toEqual([tree]);
			child.emit("close", 0, null);
			expect(spawnedCwds()).toEqual([tree, resolve(tree, "packages/ui")]);
			expect(onSeeded).not.toHaveBeenCalled();
			child.emit("close", 0, null);

			expect(onSeeded).toHaveBeenCalledTimes(1);
			expect(logs).toContain(
				`worktree ${tree} installing deps in packages/ui: npm install`,
			);
			expect(logs).toContain(
				`worktree ${tree} install in packages/ui complete`,
			);
		});

		it("detects the package manager in each path", () => {
			mockDetect.mockImplementation((dir) =>
				dir.endsWith("ui") ? "pnpm install" : "npm install",
			);

			seedPaths([".", "ui"]);
			child.emit("close", 0, null);

			const [, args, options] = mockSpawn.mock.calls[1] as unknown as [
				string,
				string[],
				{ cwd: string },
			];
			expect(options.cwd).toBe(resolve(tree, "ui"));
			expect(args.at(-1)).toMatch(/&& pnpm install$/);
		});

		it("skips the remaining paths once one fails, still releasing the session", () => {
			const onSeeded = vi.fn();

			seedPaths([".", "a", "b"], onSeeded);
			child.emit("close", 1, null);

			expect(spawnedCwds()).toEqual([tree]);
			expect(onSeeded).toHaveBeenCalledTimes(1);
			expect(logs).toContain(
				`worktree ${tree} install skipping remaining paths: a, b`,
			);
		});

		it("stops at a path with no package.json", () => {
			const onSeeded = vi.fn();
			mockDetect.mockImplementation((dir) =>
				dir.endsWith("missing") ? null : "npm install",
			);

			seedPaths([".", "missing", "b"], onSeeded);
			child.emit("close", 0, null);

			expect(spawnedCwds()).toEqual([tree]);
			expect(onSeeded).toHaveBeenCalledTimes(1);
			expect(logs).toContain(
				`worktree ${tree} install in missing failed: no package.json at ${resolve(tree, "missing")}; skipping remaining paths`,
			);
		});

		it("stops when a path's install cannot start", () => {
			const onSeeded = vi.fn();

			seedPaths([".", "b"], onSeeded);
			child.emit("error", new Error("spawn bash ENOENT"));

			expect(spawnedCwds()).toEqual([tree]);
			expect(onSeeded).toHaveBeenCalledTimes(1);
		});

		it.runIf(process.platform !== "win32")(
			"kills the running path's install at teardown and starts no further paths",
			() => {
				const onSeeded = vi.fn();
				const killed: number[] = [];
				const kill = vi.spyOn(process, "kill").mockImplementation(((
					pid: number,
				) => {
					killed.push(pid);
					return true;
				}) as typeof process.kill);

				seedPaths([".", "a", "b"], onSeeded);
				child.emit("close", 0, null);
				stopInstall(tree);
				child.emit("close", 0, null);

				expect(killed).toEqual([-4321]);
				expect(spawnedCwds()).toEqual([tree, resolve(tree, "a")]);
				expect(onSeeded).toHaveBeenCalledTimes(1);
				kill.mockRestore();
			},
		);
	});
});
