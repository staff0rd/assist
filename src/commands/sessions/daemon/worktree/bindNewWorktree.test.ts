import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import { bindNewWorktree } from "./bindNewWorktree";
import { seedWorktree } from "./seedWorktree";
import { seedHeldSession } from "./seedHeldSession";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./seedWorktree", () => ({ seedWorktree: vi.fn() }));

function allocation(ready: Promise<void>) {
	return {
		cwd: "/git/repo-2",
		kind: "worktree" as const,
		created: true,
		clone: "/git/repo",
		ready,
	};
}

describe("bindNewWorktree", () => {
	it("seeds the worktree only once it has been added", async () => {
		let finish = () => {};
		const ready = new Promise<void>((resolve) => {
			finish = resolve;
		});
		const session = makeSession({ id: "1", cwd: "/git/repo-2" });

		bindNewWorktree(session, allocation(ready), vi.fn());

		expect(session.awaitingSeed).toBe(true);
		expect(seedWorktree).not.toHaveBeenCalled();
		finish();
		await vi.waitFor(() =>
			expect(seedWorktree).toHaveBeenCalledWith(
				"/git/repo-2",
				"/git/repo",
				expect.any(Function),
				expect.any(Function),
			),
		);
	});

	it("starts the held session with a failing start when the worktree cannot be added", async () => {
		const session = makeSession({ id: "1", cwd: "/git/repo-2" });
		const startHeld = vi.fn();

		bindNewWorktree(
			session,
			allocation(Promise.reject(new Error("branch exists"))),
			vi.fn(),
			startHeld,
		);

		await vi.waitFor(() => expect(startHeld).toHaveBeenCalledWith(session));
		expect(() => session.pendingStart?.()).toThrow(
			"worktree /git/repo-2 could not be created: branch exists",
		);
	});

	it("starts the held session normally when seeding succeeds", () => {
		vi.mocked(seedWorktree).mockImplementationOnce((_p, _c, onSeeded) =>
			onSeeded?.({ ok: true }),
		);
		const start = vi.fn();
		const session = makeSession({ id: "1", pendingStart: start });
		const startHeld = vi.fn();

		seedHeldSession(session, "/git/repo-2", "/git/repo", vi.fn(), startHeld);

		expect(startHeld).toHaveBeenCalledWith(session);
		expect(session.pendingStart).toBe(start);
	});

	it("refuses the held session with the install failure when seeding fails", () => {
		vi.mocked(seedWorktree).mockImplementationOnce((_p, _c, onSeeded) =>
			onSeeded?.({
				ok: false,
				path: "coach-tools",
				reason: "signal SIGTERM",
				output: "npm warn EBADENGINE",
			}),
		);
		const start = vi.fn();
		const session = makeSession({ id: "1", pendingStart: start });
		const startHeld = vi.fn();
		const failure =
			"worktree /git/repo-2 install in coach-tools failed (signal SIGTERM):\nnpm warn EBADENGINE";

		seedHeldSession(session, "/git/repo-2", "/git/repo", vi.fn(), startHeld);

		expect(startHeld).toHaveBeenCalledWith(session, failure);
		expect(() => session.pendingStart?.()).toThrow(failure);
		expect(start).not.toHaveBeenCalled();
	});
});
