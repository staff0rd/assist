import { describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import type { SessionClient } from "./broadcast";
import { MissingCwdError } from "./spawnPty";
import { startHeldSession } from "./startHeldSession";
import type { Session } from "./types";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./wirePtyEvents", () => ({ wirePtyEvents: vi.fn() }));

const heldTree = {
	id: "4",
	pty: null,
	cwd: "/git/repo-2",
	worktree: { path: "/git/repo-2", clone: "/git/repo" },
} satisfies Partial<Session>;

describe("startHeldSession", () => {
	it("spawns the held pty once seeding completes", () => {
		const { pty } = makePty();
		const session = makeSession({ ...heldTree, pendingStart: () => pty });
		const notify = vi.fn();

		startHeldSession(
			session,
			new Map([[session.id, session]]),
			new Set<SessionClient>(),
			vi.fn(),
			notify,
		);

		expect(session.pty).toBe(pty);
		expect(session.pendingStart).toBeUndefined();
		expect(notify).toHaveBeenCalled();
	});

	it("does not spawn when the card was dismissed while its tree was seeding", () => {
		const start = vi.fn(() => makePty().pty);
		const session = makeSession({ ...heldTree, pendingStart: start });

		startHeldSession(
			session,
			new Map(),
			new Set<SessionClient>(),
			vi.fn(),
			vi.fn(),
		);

		expect(start).not.toHaveBeenCalled();
		expect(session.pty).toBeNull();
	});

	it("does not spawn into a tree that is being torn down", () => {
		const start = vi.fn(() => makePty().pty);
		const session = makeSession({
			...heldTree,
			pendingStart: start,
			closing: true,
		});

		startHeldSession(
			session,
			new Map([[session.id, session]]),
			new Set<SessionClient>(),
			vi.fn(),
			vi.fn(),
		);

		expect(start).not.toHaveBeenCalled();
		expect(session.pty).toBeNull();
	});

	it("applies the dimensions the browser reported while the pty was held", () => {
		const { pty } = makePty();
		const session = makeSession({
			...heldTree,
			pendingStart: () => pty,
			cols: 200,
			rows: 50,
		});

		startHeldSession(
			session,
			new Map([[session.id, session]]),
			new Set<SessionClient>(),
			vi.fn(),
			vi.fn(),
		);

		expect(pty.resize).toHaveBeenCalledWith(200, 50);
	});

	it("surfaces a tree that vanished during seeding on the card instead of throwing out of the install callback", () => {
		const session = makeSession({
			...heldTree,
			pendingStart: () => {
				throw new MissingCwdError("/git/repo-2");
			},
		});
		const notify = vi.fn();
		const sent: string[] = [];
		const clients = new Set<SessionClient>([
			{ send: (data: string) => sent.push(data) },
		]);

		expect(() =>
			startHeldSession(
				session,
				new Map([[session.id, session]]),
				clients,
				(s, status) => {
					s.status = status;
				},
				notify,
			),
		).not.toThrow();

		expect(session.status).toBe("error");
		expect(session.pty).toBeNull();
		expect(session.pendingStart).toBeUndefined();
		expect(session.error).toBe(
			"working directory no longer exists: /git/repo-2",
		);
		expect(session.scrollback).toContain("/git/repo-2");
		expect(notify).toHaveBeenCalled();
	});

	it("is inert for a session that was never held", () => {
		const session = makeSession(heldTree);
		const notify = vi.fn();

		startHeldSession(
			session,
			new Map([[session.id, session]]),
			new Set<SessionClient>(),
			vi.fn(),
			notify,
		);

		expect(session.pty).toBeNull();
		expect(notify).not.toHaveBeenCalled();
	});
});
