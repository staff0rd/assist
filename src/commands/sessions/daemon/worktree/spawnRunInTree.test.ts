import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import { spawnRun } from "../spawnRun";
import { spawnRunInTree } from "./spawnRunInTree";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../spawnRun", () => ({ spawnRun: vi.fn(() => ({ pid: 1 })) }));
vi.mock("../serverRunMeta", () => ({ serverRunMeta: () => ({}) }));
vi.mock("./worktreeConfigFor", () => ({
	worktreeConfigFor: () => ({ install: ["api", "web"] }),
}));

const worktree = { path: "/git/repo-2", clone: "/git/repo" };

function spawnIn(sessions: Map<string, Session>, cwd: string): Session {
	const id = spawnRunInTree(
		sessions,
		(create) => {
			const session = create("21");
			sessions.set(session.id, session);
			return session.id;
		},
		{ runName: "dev-api", runArgs: [], cwd },
	);
	return sessions.get(id) as Session;
}

describe("spawnRunInTree", () => {
	it("holds a run launched into a worktree that is still installing", () => {
		vi.mocked(spawnRun).mockClear();
		const seeding = makeSession({
			id: "20",
			cwd: "/git/repo-2",
			pendingStart: vi.fn(),
			awaitingSeed: true,
			worktree,
		});
		const run = spawnIn(new Map([[seeding.id, seeding]]), "/git/repo-2/api");

		expect(spawnRun).not.toHaveBeenCalled();
		expect(run.pty).toBeNull();
		expect(run.pendingStart).toBeDefined();
		expect(run.awaitingSeed).toBe(true);
		expect(run.worktree).toEqual(worktree);
		expect(run.seeding).toBe(
			"Waiting for repo-2 to finish installing dependencies in api, web…",
		);
	});

	it("spawns at once when the worktree has finished seeding", () => {
		vi.mocked(spawnRun).mockClear();
		const seeded = makeSession({ id: "20", cwd: "/git/repo-2", worktree });
		const run = spawnIn(new Map([[seeded.id, seeded]]), "/git/repo-2");

		expect(spawnRun).toHaveBeenCalledOnce();
		expect(run.pendingStart).toBeUndefined();
		expect(run.seeding).toBeUndefined();
	});

	it("ignores a seeding worktree the run is not inside", () => {
		vi.mocked(spawnRun).mockClear();
		const seeding = makeSession({
			id: "20",
			cwd: "/git/repo-2",
			pendingStart: vi.fn(),
			awaitingSeed: true,
			worktree,
		});
		const run = spawnIn(new Map([[seeding.id, seeding]]), "/git/repo-20");

		expect(spawnRun).toHaveBeenCalledOnce();
		expect(run.awaitingSeed).toBeUndefined();
	});
});
