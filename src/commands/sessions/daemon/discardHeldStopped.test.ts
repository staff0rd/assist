import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { discardTree } from "./discardTree";
import { dismissSessionGated } from "./dismissSessionGated";
import { closeBlockReason } from "./worktree/closeBlockReason";
import { reapWorktree } from "./worktree/reapWorktree";
import { resolveCloseDurability } from "./worktree/resolveCloseDurability";
import { watchGitState } from "./worktree/watchGitState";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./worktree/closeBlockReason", () => ({ closeBlockReason: vi.fn() }));
vi.mock("./worktree/reapWorktree", () => ({ reapWorktree: vi.fn() }));
vi.mock("./worktree/watchGitState", () => ({ watchGitState: vi.fn() }));
vi.mock("./dismissSession", () => ({
	dismissSession: vi.fn((sessions: Map<string, Session>, id: string) =>
		sessions.delete(id),
	),
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

async function holdStoppedWithArmedWatcher() {
	let onGitChange: () => void = () => {};
	let closed = false;
	const watcher = {
		close: vi.fn(() => {
			closed = true;
		}),
	};
	const fireGitChange = () => {
		if (!closed) onGitChange();
	};
	vi.mocked(watchGitState).mockImplementation((_path, onChange) => {
		onGitChange = onChange;
		return watcher;
	});
	vi.mocked(closeBlockReason).mockResolvedValueOnce({
		reason: "live process gh in tree",
		live: false,
	});
	const session = makeSession({
		id: "2",
		status: "running",
		closing: true,
		worktree: { path: "/git/repo-3", clone: "/git/repo" },
	});
	const sessions = new Map([[session.id, session]]);
	await resolveCloseDurability(session, vi.fn(), vi.fn());
	return { session, sessions, watcher, fireGitChange };
}

describe("discarding a session held stopped", () => {
	it("disarms the git watcher so its recheck cannot reap alongside the discard", async () => {
		const { session, sessions, watcher, fireGitChange } =
			await holdStoppedWithArmedWatcher();
		expect(session.status).toBe("stopped");
		vi.mocked(closeBlockReason).mockResolvedValue(undefined);
		vi.mocked(reapWorktree).mockImplementation(async () => {
			fireGitChange();
			await flush();
			return { removed: true };
		});
		const notify = vi.fn();

		dismissSessionGated(sessions, session.id, notify, true);
		await flush();
		await flush();

		expect(watcher.close).toHaveBeenCalled();
		expect(session.gitWatcher).toBeUndefined();
		expect(reapWorktree).toHaveBeenCalledOnce();
		expect(sessions.has(session.id)).toBe(false);
		expect(session.worktree).toBeUndefined();
		expect(session.releasedFromClone).toBe("/git/repo");
	});

	it("does not throw when the session is finalized elsewhere while its reap is awaited", async () => {
		const { session, sessions } = await holdStoppedWithArmedWatcher();
		const discarded = vi.fn();
		vi.mocked(reapWorktree).mockImplementation(async () => {
			session.worktree = undefined;
			sessions.delete(session.id);
			return { removed: true };
		});
		await expect(
			discardTree(session, discarded, vi.fn()),
		).resolves.toBeUndefined();
		expect(discarded).not.toHaveBeenCalled();
	});
});
