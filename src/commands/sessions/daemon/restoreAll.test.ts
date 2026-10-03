import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { loadPersistedSessions } from "./loadPersistedSessions";
import { restoreAll } from "./restoreAll";
import { restoreSession } from "./restoreSession";

vi.mock("./loadPersistedSessions", () => ({
	loadPersistedSessions: vi.fn(() => []),
}));
vi.mock("./restoreSession", () => ({ restoreSession: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
const maxLive = vi.fn(() => 24);
vi.mock("./maxLiveSessions", () => ({ maxLiveSessions: () => maxLive() }));

const loadPersistedMock = loadPersistedSessions as unknown as ReturnType<
	typeof vi.fn
>;
const restoreSessionMock = restoreSession as unknown as ReturnType<
	typeof vi.fn
>;
const daemonLogMock = daemonLog as unknown as ReturnType<typeof vi.fn>;

function persistedEntry(index: number) {
	return {
		id: String(index),
		name: `session ${index}`,
		commandType: "assist" as const,
		assistArgs: ["backlog", "run", `a${index}`],
		cwd: `/repo/tree-${index}`,
		startedAt: 1,
		claudeSessionId: `claude-${index}`,
	};
}

function harness(recoveryCard?: (create: (id: string) => Session) => string) {
	const sessions = new Map<string, Session>();
	const counter = { next: 1 };
	const spawn = (create: (id: string) => Session) => {
		const session = create(String(counter.next++));
		sessions.set(session.id, session);
		return session.id;
	};
	return { sessions, spawner: { spawn, recoveryCard: recoveryCard ?? spawn } };
}

describe("restoreAll", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		maxLive.mockReturnValue(24);
		restoreSessionMock.mockImplementation(
			(id: string, p: { name: string; launchedFrom?: string }) =>
				makeSession({
					id,
					name: p.name,
					status: "running",
					launchedFrom: p.launchedFrom,
				}),
		);
	});

	it("restores past the old restore cap of 10 up to the default ceiling", () => {
		const entries = Array.from({ length: 24 }, (_, i) => persistedEntry(i));
		loadPersistedMock.mockReturnValue(entries);
		const { sessions, spawner } = harness();

		const names = restoreAll(spawner, sessions);

		expect(names).toEqual(entries.map((e) => e.name));
		expect(sessions.size).toBe(24);
		expect([...sessions.values()].every((s) => s.status === "running")).toBe(
			true,
		);
	});

	it("restores every persisted session when the set fits the configured ceiling", () => {
		maxLive.mockReturnValue(30);
		const entries = Array.from({ length: 30 }, (_, i) => persistedEntry(i));
		loadPersistedMock.mockReturnValue(entries);
		const { sessions, spawner } = harness();

		const names = restoreAll(spawner, sessions);

		expect(names).toEqual(entries.map((e) => e.name));
		expect(sessions.size).toBe(entries.length);
	});

	it("stops restoring at the configured ceiling", () => {
		maxLive.mockReturnValue(3);
		const entries = Array.from({ length: 5 }, (_, i) => persistedEntry(i));
		loadPersistedMock.mockReturnValue(entries);
		const { sessions, spawner } = harness();

		const names = restoreAll(spawner, sessions);

		expect(names).toEqual(entries.slice(0, 3).map((e) => e.name));
		expect([...sessions.values()].map((s) => s.status)).toEqual([
			"running",
			"running",
			"running",
			"stopped",
			"stopped",
		]);
	});

	it("names sessions.maxLive when it caps a restore", () => {
		maxLive.mockReturnValue(2);
		loadPersistedMock.mockReturnValue(
			Array.from({ length: 3 }, (_, i) => persistedEntry(i)),
		);
		const { sessions, spawner } = harness();

		restoreAll(spawner, sessions);

		expect(daemonLogMock).toHaveBeenCalledWith(
			expect.stringContaining("restore capped at 2 (sessions.maxLive)"),
		);
	});

	it("surfaces sessions past the cap as cards instead of discarding them", () => {
		maxLive.mockReturnValue(4);
		const entries = Array.from({ length: 7 }, (_, i) => persistedEntry(i));
		loadPersistedMock.mockReturnValue(entries);
		const { sessions, spawner } = harness();

		const names = restoreAll(spawner, sessions);

		expect(names).toHaveLength(4);
		expect([...sessions.values()].map((s) => s.name)).toEqual(
			entries.map((e) => e.name),
		);
	});

	it("keeps the command, cwd and transcript of a deferred session", () => {
		maxLive.mockReturnValue(2);
		const entries = Array.from({ length: 3 }, (_, i) => persistedEntry(i));
		loadPersistedMock.mockReturnValue(entries);
		const { sessions, spawner } = harness();

		restoreAll(spawner, sessions);

		const deferred = [...sessions.values()].at(-1) as Session;
		const last = entries.at(-1) as ReturnType<typeof persistedEntry>;
		expect(deferred).toMatchObject({
			name: last.name,
			status: "stopped",
			commandType: "assist",
			assistArgs: last.assistArgs,
			cwd: last.cwd,
			claudeSessionId: last.claudeSessionId,
			pty: null,
		});
		expect(deferred.scrollback).toContain("Not resumed");
	});

	it("logs the id, name and cwd of every session it could not restore", () => {
		maxLive.mockReturnValue(2);
		const entries = Array.from({ length: 4 }, (_, i) => persistedEntry(i));
		loadPersistedMock.mockReturnValue(entries);
		const { sessions, spawner } = harness();

		restoreAll(spawner, sessions);

		for (const entry of entries.slice(2))
			expect(daemonLogMock).toHaveBeenCalledWith(
				expect.stringContaining(
					`id=${entry.id} name=${JSON.stringify(entry.name)} cwd=${entry.cwd}`,
				),
			);
	});

	it("logs the id, name and cwd of a session whose respawn throws", () => {
		const entries = [persistedEntry(0), persistedEntry(1)];
		loadPersistedMock.mockReturnValue(entries);
		restoreSessionMock.mockImplementation(
			(_id: string, p: { name: string }) => {
				if (p.name === entries[1].name) throw new Error("pty refused");
				return makeSession({ id: "1", name: p.name, status: "running" });
			},
		);
		const { sessions, spawner } = harness();

		restoreAll(spawner, sessions);

		expect(daemonLogMock).toHaveBeenCalledWith(
			`failed to restore session id=${entries[1].id} name=${JSON.stringify(entries[1].name)} cwd=${entries[1].cwd}: pty refused`,
		);
		expect([...sessions.values()].map((s) => s.status)).toEqual([
			"running",
			"error",
		]);
	});

	it("logs a dropped session in full when even its error card cannot be created", () => {
		const entries = [persistedEntry(0)];
		loadPersistedMock.mockReturnValue(entries);
		restoreSessionMock.mockImplementation(() => {
			throw new Error("pty refused");
		});
		const refuse = () => {
			throw new Error("card refused");
		};
		const { sessions, spawner } = harness(refuse);

		restoreAll(spawner, sessions);

		expect(daemonLogMock).toHaveBeenCalledWith(
			`dropped persisted session id=${entries[0].id} name=${JSON.stringify(entries[0].name)} cwd=${entries[0].cwd}: card refused`,
		);
	});

	it("relinks a launched session to the new id of the card that launched it", () => {
		loadPersistedMock.mockReturnValue([
			persistedEntry(7),
			{ ...persistedEntry(9), launchedFrom: "7" },
		]);
		const { sessions, spawner } = harness();

		restoreAll(spawner, sessions);

		expect(sessions.get("1")?.name).toBe("session 7");
		expect(sessions.get("2")?.launchedFrom).toBe("1");
	});

	it("relinks a launched session restored before its launcher", () => {
		loadPersistedMock.mockReturnValue([
			{ ...persistedEntry(9), launchedFrom: "7" },
			persistedEntry(7),
		]);
		const { sessions, spawner } = harness();

		restoreAll(spawner, sessions);

		expect(sessions.get("2")?.name).toBe("session 7");
		expect(sessions.get("1")?.launchedFrom).toBe("2");
	});

	it("leaves a launched session at the top level when its launcher was not persisted", () => {
		loadPersistedMock.mockReturnValue([
			{ ...persistedEntry(9), launchedFrom: "7" },
		]);
		const { sessions, spawner } = harness();

		restoreAll(spawner, sessions);

		expect(sessions.get("1")?.launchedFrom).toBeUndefined();
	});

	it("does not attach a stale launchedFrom to the session that inherits that id", () => {
		loadPersistedMock.mockReturnValue([
			persistedEntry(5),
			{ ...persistedEntry(6), launchedFrom: "1" },
		]);
		const { sessions, spawner } = harness();

		restoreAll(spawner, sessions);

		expect(sessions.get("1")?.name).toBe("session 5");
		expect(sessions.get("2")?.launchedFrom).toBeUndefined();
	});

	it("leaves a launched session at the top level when its launcher was deferred past the cap", () => {
		maxLive.mockReturnValue(1);
		loadPersistedMock.mockReturnValue([
			{ ...persistedEntry(9), launchedFrom: "7" },
			persistedEntry(7),
		]);
		const { sessions, spawner } = harness();

		restoreAll(spawner, sessions);

		expect(sessions.get("2")?.status).toBe("stopped");
		expect(sessions.get("1")?.launchedFrom).toBeUndefined();
	});

	it("drops a persisted session whose cwd lies outside any project root", () => {
		const stale = {
			...persistedEntry(3),
			name: "recovered myrepo-2",
			cwd: join(tmpdir(), "clone-collision-ABC123", "real", "myrepo-2"),
		};
		loadPersistedMock.mockReturnValue([persistedEntry(1), stale]);
		const { sessions, spawner } = harness();

		const names = restoreAll(spawner, sessions);

		expect(names).toEqual(["session 1"]);
		expect(sessions.size).toBe(1);
		expect(daemonLogMock).toHaveBeenCalledWith(
			expect.stringContaining("lies outside any project root"),
		);
	});

	it("logs a deferred session in full when even its card cannot be created", () => {
		maxLive.mockReturnValue(2);
		const entries = Array.from({ length: 3 }, (_, i) => persistedEntry(i));
		loadPersistedMock.mockReturnValue(entries);
		const refuse = () => {
			throw new Error("card refused");
		};
		const { sessions, spawner } = harness(refuse);

		restoreAll(spawner, sessions);

		const last = entries.at(-1) as ReturnType<typeof persistedEntry>;
		expect(daemonLogMock).toHaveBeenCalledWith(
			`dropped persisted session id=${last.id} name=${JSON.stringify(last.name)} cwd=${last.cwd}: card refused`,
		);
	});
});
