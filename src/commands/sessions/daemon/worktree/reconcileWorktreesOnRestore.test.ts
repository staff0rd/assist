import { existsSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../../../test/mocks/fsMock";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { loadPersistedSessions } from "../loadPersistedSessions";
import { forgetWorktree, readWorktreeRegistry } from "./readWorktreeRegistry";
import { reapWorktree } from "./reapWorktree";
import { reclaimVanishedWorktrees } from "./reclaimVanishedWorktrees";
import { reconcileWorktreesOnRestore } from "./reconcileWorktreesOnRestore";
import { armStoppedSession } from "./rearmStoppedSessions";
import { checkDurability } from "./treeDurability";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../../test/mocks/fsMock")
	).fsMock(),
);
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../../../shared/findRepoRoot", () => ({
	findRepoRoot: (cwd: string) => cwd,
}));
vi.mock("../loadPersistedSessions", () => ({
	loadPersistedSessions: vi.fn(() => []),
}));
vi.mock("./bindNewWorktree", () => ({ bindRestoredWorktrees: vi.fn() }));
vi.mock("./readWorktreeRegistry", () => ({
	readWorktreeRegistry: vi.fn(),
	forgetWorktree: vi.fn(),
}));
vi.mock("./reapWorktree", () => ({
	reapWorktree: vi.fn(() => Promise.resolve({ removed: true })),
}));
vi.mock("./reclaimVanishedWorktrees", () => ({
	reclaimVanishedWorktrees: vi.fn(() => Promise.resolve()),
}));
vi.mock("./rearmStoppedSessions", () => ({ armStoppedSession: vi.fn() }));
vi.mock("./describeHeldWork", () => ({
	describeHeldWork: vi.fn(() =>
		Promise.resolve({
			summary: "2 uncommitted files",
			items: [" M src/a.ts", " M src/b.ts"],
		}),
	),
}));
vi.mock("./treeDurability", () => ({ checkDurability: vi.fn() }));

const existsMock = vi.mocked(existsSync);
const registryMock = readWorktreeRegistry as unknown as ReturnType<
	typeof vi.fn
>;
const reapMock = reapWorktree as unknown as ReturnType<typeof vi.fn>;
const reclaimMock = reclaimVanishedWorktrees as unknown as ReturnType<
	typeof vi.fn
>;
const armMock = armStoppedSession as unknown as ReturnType<typeof vi.fn>;
const durabilityMock = checkDurability as unknown as ReturnType<typeof vi.fn>;
const persistedMock = loadPersistedSessions as unknown as ReturnType<
	typeof vi.fn
>;
const forgetMock = forgetWorktree as unknown as ReturnType<typeof vi.fn>;
const logMock = daemonLog as unknown as ReturnType<typeof vi.fn>;

function reconcile(sessions: Map<string, Session>) {
	const spawnWith = (create: (id: string) => Session) => {
		const session = create(String(sessions.size + 1));
		sessions.set(session.id, session);
		return session.id;
	};
	reconcileWorktreesOnRestore(sessions, spawnWith, () => {});
	return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("reconcileWorktreesOnRestore", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(true);
		vi.mocked(realpathSync).mockImplementation((path) => String(path));
		persistedMock.mockReturnValue([]);
		registryMock.mockReturnValue([
			{ path: "/git/repo-2", clone: "/git/repo", origin: "git@x:y.git" },
		]);
	});

	it("resurfaces an undurable orphan as a visible stopped card and never removes it", async () => {
		durabilityMock.mockResolvedValue({
			durable: false,
			reason: "uncommitted changes",
		});
		const sessions = new Map<string, Session>();

		await reconcile(sessions);

		const card = [...sessions.values()][0];
		expect(card?.status).toBe("stopped");
		expect(card?.name).toBe("recovered repo-2");
		expect(card?.subtitle).toBe("2 uncommitted files in /git/repo-2");
		expect(card?.scrollback).toContain("Recovered workspace /git/repo-2");
		expect(card?.scrollback).toContain(" M src/a.ts");
		expect(card?.pty).toBeNull();
		expect(card?.cwd).toBe("/git/repo-2");
		expect(card?.worktree).toEqual({ path: "/git/repo-2", clone: "/git/repo" });
		expect(card?.undurable).toEqual({
			reason: "uncommitted changes",
			removesTree: true,
		});
		expect(reapMock).not.toHaveBeenCalled();
		expect(armMock).toHaveBeenCalledTimes(1);
	});

	it("prunes a registry entry pointing outside any project root", async () => {
		const stale = `${tmpdir()}/clone-collision-ABC123/real/myrepo-2`;
		registryMock.mockReturnValue([
			{ path: stale, clone: `${tmpdir()}/clone-collision-ABC123/real/myrepo` },
		]);
		const sessions = new Map<string, Session>();

		await reconcile(sessions);

		expect(sessions.size).toBe(0);
		expect(durabilityMock).not.toHaveBeenCalled();
		expect(reclaimMock).not.toHaveBeenCalled();
		expect(forgetMock).toHaveBeenCalledWith(stale);
	});

	it("reaps a durable orphan without leaving a card behind", async () => {
		durabilityMock.mockResolvedValue({ durable: true });
		const sessions = new Map<string, Session>();

		await reconcile(sessions);

		expect(reapMock).toHaveBeenCalledWith("/git/repo-2");
		expect(sessions.size).toBe(0);
	});

	it("leaves a worktree a restored session still holds alone", async () => {
		const held = makeSession({
			id: "1",
			name: "s",
			status: "stopped",
			cwd: "/git/repo-2",
		});

		await reconcile(new Map([["1", held]]));

		expect(durabilityMock).not.toHaveBeenCalled();
		expect(reapMock).not.toHaveBeenCalled();
	});

	it("leaves a worktree a persisted session still holds alone", async () => {
		persistedMock.mockReturnValue([{ cwd: "/git/repo-2" }]);

		await reconcile(new Map());

		expect(durabilityMock).not.toHaveBeenCalled();
	});

	it("reclaims the bookkeeping and branch of a worktree already gone from disk", async () => {
		existsMock.mockImplementation((path) => String(path) !== "/git/repo-2");

		await reconcile(new Map());

		expect(durabilityMock).not.toHaveBeenCalled();
		expect(reclaimMock).toHaveBeenCalledWith("/git/repo", [
			{ path: "/git/repo-2", branch: "repo-2" },
		]);
	});

	it("reclaims a vanished worktree a restored session still claims", async () => {
		existsMock.mockImplementation((path) => String(path) !== "/git/repo-2");
		const held = makeSession({
			id: "1",
			name: "s",
			status: "error",
			cwd: "/git/repo-2",
		});

		await reconcile(new Map([["1", held]]));

		expect(reclaimMock).toHaveBeenCalledWith("/git/repo", [
			{ path: "/git/repo-2", branch: "repo-2" },
		]);
		expect(logMock).toHaveBeenCalledWith(
			expect.stringContaining(
				'session 1 ("s") claims worktree /git/repo-2, which is gone from disk',
			),
		);
	});

	it("reclaims a vanished worktree a persisted session still claims", async () => {
		existsMock.mockImplementation((path) => String(path) !== "/git/repo-2");
		persistedMock.mockReturnValue([{ cwd: "/git/repo-2" }]);

		await reconcile(new Map());

		expect(reclaimMock).toHaveBeenCalledWith("/git/repo", [
			{ path: "/git/repo-2", branch: "repo-2" },
		]);
	});
});
