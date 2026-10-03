import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../../../test/mocks/fsMock";
import { gitResult, gitSyncResult } from "./git";
import { checkDurability, checkDurabilitySync } from "./treeDurability";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../../test/mocks/fsMock")
	).fsMock(),
);
vi.mock("./git", () => ({ gitResult: vi.fn(), gitSyncResult: vi.fn() }));

const existsMock = vi.mocked(existsSync);
const gitMock = gitResult as unknown as ReturnType<typeof vi.fn>;
const gitSyncMock = gitSyncResult as unknown as ReturnType<typeof vi.fn>;

type Replies = Record<string, { ok: boolean; out?: string }>;

function reply(replies: Replies, args: string[]) {
	const match = replies[args[0] as string] ?? { ok: false };
	return match.ok
		? { ok: true, out: match.out ?? "" }
		: { ok: false, error: "fatal: not a git repository" };
}

function gitReplies(replies: Replies) {
	gitMock.mockImplementation((_cwd: string, args: string[]) =>
		Promise.resolve(reply(replies, args)),
	);
	gitSyncMock.mockImplementation((_cwd: string, args: string[]) =>
		reply(replies, args),
	);
}

describe("checkDurability", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(true);
	});

	it("marks a tree that no longer exists as gone, not as landed work", async () => {
		existsMock.mockReturnValue(false);

		expect(await checkDurability("/git/repo-3")).toEqual({
			durable: true,
			gone: true,
		});
		expect(gitMock).not.toHaveBeenCalled();
	});

	it("never reports unpushed commits when the tree state cannot be read", async () => {
		gitReplies({});

		const durability = await checkDurability("/git/broken");

		expect(durability.durable).toBe(false);
		expect(durability.durable === false ? durability.reason : "").not.toContain(
			"unpushed commits",
		);
	});

	it("holds a dirty tree", async () => {
		gitReplies({ status: { ok: true, out: " M src/a.ts" } });

		expect(await checkDurability("/git/repo-2")).toEqual({
			durable: false,
			reason: "uncommitted changes",
		});
	});

	it("is durable once the branch is clean and its upstream has the commits", async () => {
		gitReplies({
			status: { ok: true, out: "" },
			"rev-parse": { ok: true, out: "origin/main" },
			"rev-list": { ok: true, out: "0" },
		});

		expect(await checkDurability("/git/repo-2")).toEqual({ durable: true });
	});

	it("holds a clean tree whose commits are ahead of its upstream and on no remote", async () => {
		gitReplies({
			status: { ok: true, out: "" },
			"rev-parse": { ok: true, out: "origin/main" },
			"rev-list": { ok: true, out: "2" },
			branch: { ok: true, out: "" },
		});

		expect(await checkDurability("/git/repo-2")).toEqual({
			durable: false,
			reason: "unpushed commits",
		});
	});

	it("is durable when a remote branch has HEAD even though the upstream is a different branch", async () => {
		gitReplies({
			status: { ok: true, out: "" },
			"rev-parse": { ok: true, out: "origin/main" },
			"rev-list": { ok: true, out: "1" },
			branch: { ok: true, out: "  origin/staff0rd/fix-ci-audit-advisories" },
		});

		expect(await checkDurability("/git/repo-2")).toEqual({ durable: true });
	});

	it("falls back to the remote-contains probe when the ahead count is unreadable", async () => {
		gitReplies({
			status: { ok: true, out: "" },
			"rev-parse": { ok: true, out: "origin/main" },
			"rev-list": { ok: false },
			branch: { ok: true, out: "  origin/feature" },
		});

		expect(await checkDurability("/git/repo-2")).toEqual({ durable: true });
	});

	it("is durable on an untracked worktree branch whose HEAD is on a remote", async () => {
		gitReplies({
			status: { ok: true, out: "" },
			"rev-parse": { ok: false },
			branch: { ok: true, out: "  origin/main" },
		});

		expect(await checkDurability("/git/repo-2")).toEqual({ durable: true });
	});

	it("holds an untracked worktree branch whose commits are on no remote", async () => {
		gitReplies({
			status: { ok: true, out: "" },
			"rev-parse": { ok: false },
			branch: { ok: true, out: "" },
		});

		expect(await checkDurability("/git/repo-2")).toEqual({
			durable: false,
			reason: "unpushed commits",
		});
	});
});

describe("checkDurabilitySync", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(true);
	});

	it("reaches the same verdict as the awaited check on a landed tree", () => {
		gitReplies({
			status: { ok: true, out: "" },
			"rev-parse": { ok: true, out: "origin/main" },
			"rev-list": { ok: true, out: "0" },
		});

		expect(checkDurabilitySync("/git/repo-2")).toEqual({ durable: true });
	});

	it("is durable when a remote branch has HEAD even though the upstream is a different branch", () => {
		gitReplies({
			status: { ok: true, out: "" },
			"rev-parse": { ok: true, out: "origin/main" },
			"rev-list": { ok: true, out: "1" },
			branch: { ok: true, out: "  origin/staff0rd/fix-ci-audit-advisories" },
		});

		expect(checkDurabilitySync("/git/repo-2")).toEqual({ durable: true });
	});

	it("holds a dirty tree without awaiting anything", () => {
		gitReplies({ status: { ok: true, out: " M src/a.ts" } });

		expect(checkDurabilitySync("/git/repo-2")).toEqual({
			durable: false,
			reason: "uncommitted changes",
		});
	});

	it("never reports unpushed commits when the tree state cannot be read", () => {
		gitReplies({});

		const durability = checkDurabilitySync("/git/broken");

		expect(durability.durable).toBe(false);
		expect(durability.durable === false ? durability.reason : "").not.toContain(
			"unpushed commits",
		);
	});

	it("marks a tree that no longer exists as gone, not as landed work", () => {
		existsMock.mockReturnValue(false);

		expect(checkDurabilitySync("/git/repo-3")).toEqual({
			durable: true,
			gone: true,
		});
		expect(gitSyncMock).not.toHaveBeenCalled();
	});
});
