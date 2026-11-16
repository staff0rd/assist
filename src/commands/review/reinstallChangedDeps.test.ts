import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { gitSyncOrNull } from "../sessions/daemon/worktree/git";
import { runInstall } from "../sessions/daemon/worktree/runInstall";
import { worktreeConfigFor } from "../sessions/daemon/worktree/worktreeConfigFor";
import { reinstallChangedDeps } from "./reinstallChangedDeps";

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));
vi.mock("../sessions/daemon/worktree/git", () => ({
	gitSyncOrNull: vi.fn(),
}));
vi.mock("../sessions/daemon/worktree/runInstall", () => ({
	runInstall: vi.fn(),
}));
vi.mock("../sessions/daemon/worktree/worktreeConfigFor", () => ({
	worktreeConfigFor: vi.fn(),
}));

const gitMock = vi.mocked(gitSyncOrNull);
const installMock = vi.mocked(runInstall);
const configMock = vi.mocked(worktreeConfigFor);
const tree = "/git/repo-2";

function configure(install: boolean | string | string[]): void {
	configMock.mockReturnValue({
		enabled: true,
		trunk: false,
		install,
		commitBeforeManualChecks: false,
		copy: [],
	});
}

function changeLockfilesIn(...dirs: string[]): void {
	gitMock.mockImplementation((_cwd, args) => {
		const files = args.slice(args.indexOf("--") + 1);
		const hit = files.find((file) =>
			dirs.some((dir) => file === join(dir, "package-lock.json")),
		);
		return hit ?? null;
	});
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "warn").mockImplementation(() => {});
	installMock.mockImplementation((_tree, _clone, _install, onSeeded) =>
		onSeeded({ ok: true }),
	);
});

describe("reinstallChangedDeps", () => {
	it("reinstalls only the install paths whose lockfile changed", async () => {
		configure(["member-app", "coach-tools"]);
		changeLockfilesIn("member-app");

		await reinstallChangedDeps(tree, "abc123");

		expect(installMock).toHaveBeenCalledWith(
			tree,
			tree,
			["member-app"],
			expect.any(Function),
		);
		expect(gitMock).toHaveBeenCalledWith(
			tree,
			expect.arrayContaining(["diff", "abc123", "HEAD"]),
		);
		expect(appendDaemonLog).toHaveBeenCalledWith(
			expect.stringContaining(
				`worktree ${tree} reinstalling deps in member-app`,
			),
		);
	});

	it("runs no install when no lockfile changed", async () => {
		configure(["member-app", "coach-tools"]);
		changeLockfilesIn();

		await reinstallChangedDeps(tree, "abc123");

		expect(installMock).not.toHaveBeenCalled();
	});

	it("runs no install when the repo configures no worktree install", async () => {
		configure(false);
		changeLockfilesIn(".");

		await reinstallChangedDeps(tree, "abc123");

		expect(installMock).not.toHaveBeenCalled();
	});

	it("reinstalls the root when its lockfile changed", async () => {
		configure(true);
		changeLockfilesIn(".");

		await reinstallChangedDeps(tree, "abc123");

		expect(installMock).toHaveBeenCalledWith(
			tree,
			tree,
			true,
			expect.any(Function),
		);
	});

	it("warns with the install failure", async () => {
		configure(["member-app"]);
		changeLockfilesIn("member-app");
		installMock.mockImplementation((_tree, _clone, _install, onSeeded) =>
			onSeeded({ ok: false, path: "member-app", reason: "exit 1", output: "" }),
		);

		await reinstallChangedDeps(tree, "abc123");

		expect(console.warn).toHaveBeenCalledWith(
			`worktree ${tree} install in member-app failed (exit 1)`,
		);
	});
});
