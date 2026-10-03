import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { git, gitOrNull } from "./git";
import { mainWorktree } from "./listWorktreePaths";
import {
	forgetWorktree,
	worktreeAttributionIncludingReaped,
} from "./readWorktreeRegistry";
import { reapWorktree } from "./reapWorktree";
import { stopInstall } from "./stopInstall";
import type * as fsMockModule from "../../../../test/mocks/fsMock";
import { checkDurability } from "./treeDurability";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../../test/mocks/fsMock")
	).fsMock(),
);
vi.mock("node:fs/promises", () => ({ rm: vi.fn(() => Promise.resolve()) }));
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./git", () => ({ git: vi.fn(), gitOrNull: vi.fn() }));
vi.mock("./listWorktreePaths", () => ({
	mainWorktree: vi.fn(() => "/git/repo" as string | null),
	listLocalBranches: vi.fn(() => ["main", "repo-2"]),
}));
vi.mock("./readWorktreeRegistry", () => ({
	forgetWorktree: vi.fn(),
	worktreeAttributionIncludingReaped: vi.fn(() => undefined),
}));
vi.mock("./stopInstall", () => ({ stopInstall: vi.fn() }));
vi.mock("./treeDurability", () => ({ checkDurability: vi.fn() }));

const existsMock = vi.mocked(existsSync);
const rmMock = rm as unknown as ReturnType<typeof vi.fn>;
const gitMock = git as unknown as ReturnType<typeof vi.fn>;
const gitOrNullMock = gitOrNull as unknown as ReturnType<typeof vi.fn>;
const forgetMock = forgetWorktree as unknown as ReturnType<typeof vi.fn>;
const durabilityMock = checkDurability as unknown as ReturnType<typeof vi.fn>;
const mainWorktreeMock = mainWorktree as unknown as ReturnType<typeof vi.fn>;
const attributionMock =
	worktreeAttributionIncludingReaped as unknown as ReturnType<typeof vi.fn>;
const stopInstallMock = stopInstall as unknown as ReturnType<typeof vi.fn>;

function gitCalls(): string[][] {
	return gitMock.mock.calls.map((call) => call[1] as string[]);
}

function gitClones(): string[] {
	return gitMock.mock.calls.map((call) => call[0] as string);
}

function strandedTree(): void {
	existsMock.mockImplementation((path) => String(path) !== "/git/repo-2/.git");
	gitMock.mockImplementation((_cwd: string, args: string[]) =>
		args[1] === "remove"
			? Promise.reject(
					new Error(
						args.includes("--force")
							? "fatal: 'repo-2' is not a working tree"
							: "error: failed to delete 'repo-2': Directory not empty",
					),
				)
			: Promise.resolve(""),
	);
}

describe("reapWorktree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(true);
		rmMock.mockResolvedValue(undefined);
		mainWorktreeMock.mockReturnValue("/git/repo");
		attributionMock.mockReturnValue(undefined);
		gitMock.mockResolvedValue("");
		gitOrNullMock.mockImplementation((cwd: string) =>
			Promise.resolve(cwd === "/git/repo" ? "main" : "repo-2"),
		);
		durabilityMock.mockResolvedValue({ durable: true });
	});

	it("removes a durable tree, deletes its branch and forgets the record", async () => {
		expect(await reapWorktree("/git/repo-2")).toEqual({ removed: true });

		expect(gitCalls()).toContainEqual(["worktree", "remove", "/git/repo-2"]);
		expect(gitCalls()).toContainEqual(["branch", "-D", "repo-2"]);
		expect(forgetMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("leaves the session's own feature branch alone, deleting only the worktree branch", async () => {
		gitOrNullMock.mockImplementation((cwd: string) =>
			Promise.resolve(cwd === "/git/repo" ? "main" : "feat/thing"),
		);

		expect(await reapWorktree("/git/repo-2")).toEqual({ removed: true });

		expect(gitCalls()).toContainEqual(["branch", "-D", "repo-2"]);
		expect(gitCalls()).not.toContainEqual(["branch", "-D", "feat/thing"]);
	});

	it("never touches an undurable tree and keeps its record for recovery", async () => {
		durabilityMock.mockResolvedValue({
			durable: false,
			reason: "uncommitted changes",
		});

		expect(await reapWorktree("/git/repo-2")).toEqual({
			removed: false,
			reason: "uncommitted changes",
		});

		expect(gitMock).not.toHaveBeenCalled();
		expect(forgetMock).not.toHaveBeenCalled();
	});

	it("retries removal forcefully once the work is proven landed", async () => {
		gitMock.mockImplementation((_cwd: string, args: string[]) =>
			args[1] === "remove" && !args.includes("--force")
				? Promise.reject(new Error("contains untracked files"))
				: Promise.resolve(""),
		);

		expect(await reapWorktree("/git/repo-2")).toEqual({ removed: true });

		expect(gitCalls()).toContainEqual([
			"worktree",
			"remove",
			"--force",
			"/git/repo-2",
		]);
		expect(forgetMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("keeps the record when removal fails outright so the next reconcile retries", async () => {
		gitMock.mockRejectedValue(new Error("worktree is locked"));

		expect(await reapWorktree("/git/repo-2")).toMatchObject({
			removed: false,
			reason: expect.stringContaining("worktree is locked"),
		});

		expect(rmMock).not.toHaveBeenCalled();
		expect(forgetMock).not.toHaveBeenCalled();
	});

	it("deletes the directory itself once git has lost the tree, then prunes, deletes the branch and forgets it", async () => {
		strandedTree();

		expect(await reapWorktree("/git/repo-2")).toEqual({ removed: true });

		expect(rmMock).toHaveBeenCalledWith(
			"/git/repo-2",
			expect.objectContaining({ recursive: true, force: true }),
		);
		expect(gitCalls()).toContainEqual(["worktree", "prune"]);
		expect(gitCalls()).toContainEqual(["branch", "-D", "repo-2"]);
		expect(forgetMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("forgets a discarded stranded tree even when every git command fails", async () => {
		existsMock.mockImplementation(
			(path) => String(path) !== "/git/repo-2/.git",
		);
		gitMock.mockRejectedValue(
			new Error("fatal: 'repo-2' is not a working tree"),
		);

		expect(await reapWorktree("/git/repo-2", true)).toEqual({ removed: true });

		expect(rmMock).toHaveBeenCalled();
		expect(forgetMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("forgets a discarded tree git refuses to remove for a reason of its own", async () => {
		gitMock.mockImplementation((_cwd: string, args: string[]) =>
			args[1] === "remove"
				? Promise.reject(new Error("fatal: 'repo-2' is locked"))
				: Promise.resolve(""),
		);

		expect(await reapWorktree("/git/repo-2", true)).toEqual({ removed: true });

		expect(rmMock).toHaveBeenCalled();
		expect(forgetMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("keeps the record when even the direct directory delete fails", async () => {
		strandedTree();
		rmMock.mockRejectedValue(new Error("EBUSY: resource busy or locked"));

		expect(await reapWorktree("/git/repo-2")).toMatchObject({
			removed: false,
			reason: expect.stringContaining("EBUSY"),
		});

		expect(forgetMock).not.toHaveBeenCalled();
	});

	it("prunes against the recorded clone when git can no longer name it", async () => {
		strandedTree();
		mainWorktreeMock.mockReturnValue(null);
		attributionMock.mockReturnValue({
			clone: "/git/repo",
			origin: "git@host:o/r.git",
		});

		expect(await reapWorktree("/git/repo-2")).toEqual({ removed: true });

		expect(gitClones()).toContain("/git/repo");
		expect(gitClones()).not.toContain("/git/repo-2");
	});

	it("forgets a tree already gone from disk instead of leaving its record live", async () => {
		existsMock.mockReturnValue(false);

		expect(await reapWorktree("/git/repo-2")).toEqual({ removed: true });

		expect(gitMock).not.toHaveBeenCalled();
		expect(forgetMock).toHaveBeenCalledWith("/git/repo-2");
	});

	it("kills a seeding install before git touches the tree", async () => {
		const order: string[] = [];
		stopInstallMock.mockImplementation(() => order.push("install killed"));
		gitMock.mockImplementation((_cwd: string, args: string[]) => {
			order.push(args.join(" "));
			return Promise.resolve("");
		});

		await reapWorktree("/git/repo-2");

		expect(stopInstallMock).toHaveBeenCalledWith("/git/repo-2");
		expect(order[0]).toBe("install killed");
	});

	it("reports why a forced discard could not remove the directory", async () => {
		strandedTree();
		rmMock.mockRejectedValue(new Error("EPERM: operation not permitted"));

		expect(await reapWorktree("/git/repo-2", true)).toMatchObject({
			removed: false,
			reason: expect.stringContaining("EPERM"),
		});

		expect(forgetMock).not.toHaveBeenCalled();
	});
});
