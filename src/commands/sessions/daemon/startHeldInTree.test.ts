import { describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import type { SessionClient } from "./broadcast";
import { startHeldInTree } from "./startHeldInTree";
import type { Session } from "./types";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./wirePtyEvents", () => ({ wirePtyEvents: vi.fn() }));

const pendingStart = () => makePty().pty;

function run(sessions: Session[], seeded: Session) {
	startHeldInTree(
		seeded,
		new Map(sessions.map((s) => [s.id, s])),
		new Set<SessionClient>(),
		vi.fn(),
		vi.fn(),
	);
}

describe("startHeldInTree", () => {
	it("starts an agent added to a stream whose workspace was still seeding", () => {
		const seeded = makeSession({
			id: "4",
			cwd: "/git/repo-2",
			pty: null,
			pendingStart,
		});
		const joined = makeSession({
			id: "5",
			cwd: "/git/repo-2",
			pty: null,
			pendingStart,
		});

		run([seeded, joined], seeded);

		expect(seeded.pty).not.toBeNull();
		expect(joined.pty).not.toBeNull();
		expect(joined.pendingStart).toBeUndefined();
	});

	it("leaves a session held in another workspace alone", () => {
		const seeded = makeSession({
			id: "4",
			cwd: "/git/repo-2",
			pty: null,
			pendingStart,
		});
		const elsewhere = makeSession({
			id: "6",
			cwd: "/git/repo-3",
			pty: null,
			pendingStart,
		});

		run([seeded, elsewhere], seeded);

		expect(seeded.pty).not.toBeNull();
		expect(elsewhere.pty).toBeNull();
		expect(elsewhere.pendingStart).toBeDefined();
	});

	it("refuses the other sessions held on the tree when its install failed", () => {
		const startJoined = vi.fn(pendingStart);
		const seeded = makeSession({
			id: "4",
			cwd: "/git/repo-2",
			pty: null,
			pendingStart,
		});
		const joined = makeSession({
			id: "5",
			cwd: "/git/repo-2",
			pty: null,
			pendingStart: startJoined,
		});
		const failure = "worktree /git/repo-2 install failed (exit 1)";

		startHeldInTree(
			seeded,
			new Map([
				[seeded.id, seeded],
				[joined.id, joined],
			]),
			new Set<SessionClient>(),
			(session, status) => {
				session.status = status;
			},
			vi.fn(),
			failure,
		);

		expect(startJoined).not.toHaveBeenCalled();
		expect(joined.status).toBe("error");
		expect(joined.error).toBe(failure);
	});

	describe("a run held on a seeding worktree", () => {
		const worktree = { path: "/git/repo-2", clone: "/git/repo" };
		const held = (startRun: () => ReturnType<typeof pendingStart>) => ({
			seeded: makeSession({
				id: "20",
				name: "repo-2/agent",
				cwd: "/git/repo-2",
				pty: null,
				pendingStart,
				worktree,
			}),
			run: makeSession({
				id: "21",
				name: "run: dev-api",
				commandType: "run",
				cwd: "/git/repo-2/api",
				pty: null,
				pendingStart: startRun,
				awaitingSeed: true,
				seeding: "Waiting for repo-2 to finish installing dependencies…",
				worktree,
			}),
		});

		it("starts the run once the install succeeds", () => {
			const startRun = vi.fn(pendingStart);
			const { seeded, run } = held(startRun);

			startHeldInTree(
				seeded,
				new Map([
					[seeded.id, seeded],
					[run.id, run],
				]),
				new Set<SessionClient>(),
				vi.fn(),
				vi.fn(),
			);

			expect(startRun).toHaveBeenCalledOnce();
			expect(run.pty).not.toBeNull();
			expect(run.awaitingSeed).toBeUndefined();
			expect(run.seeding).toBeUndefined();
		});

		it("does not start the run when the install failed, naming the directory and the agent session", () => {
			const startRun = vi.fn(pendingStart);
			const { seeded, run } = held(startRun);

			startHeldInTree(
				seeded,
				new Map([
					[seeded.id, seeded],
					[run.id, run],
				]),
				new Set<SessionClient>(),
				(session, status) => {
					session.status = status;
				},
				vi.fn(),
				"worktree /git/repo-2 install in api failed (exit 1)",
			);

			expect(startRun).not.toHaveBeenCalled();
			expect(run.status).toBe("error");
			expect(run.error).toContain("install in api failed");
			expect(run.error).toContain('session 20 ("repo-2/agent")');
		});
	});
});
