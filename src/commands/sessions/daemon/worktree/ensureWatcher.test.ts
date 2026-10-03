import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as makePtyModule from "../../../../test/mothers/makePty";
import { makeSession } from "../../../../test/mothers/makeSession";
import type * as makeSessionModule from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import { createWatcherSession } from "../createWatcherSession";
import { daemonLog } from "../daemonLog";
import { ensureWatcher } from "./ensureWatcher";
import type { TreeSpawnContext } from "./allocateAndBind";
import { worktreeConfigFor } from "./worktreeConfigFor";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../../../shared/findRepoRoot", () => ({
	findRepoRoot: (cwd: string) => (cwd.startsWith("/git/repo") ? cwd : null),
}));
vi.mock("./listWorktreePaths", () => ({ mainWorktree: () => "/git/repo" }));
vi.mock("./worktreeConfigFor", () => ({
	worktreeConfigFor: vi.fn(),
}));
vi.mock("../createWatcherSession", async () => {
	const { makeSession } = await vi.importActual<typeof makeSessionModule>(
		"../../../../test/mothers/makeSession",
	);
	const { makePty } = await vi.importActual<typeof makePtyModule>(
		"../../../../test/mothers/makePty",
	);
	return {
		createWatcherSession: vi.fn((id: string, cwd: string) =>
			makeSession({
				id,
				status: "running",
				pty: makePty().pty,
				cwd,
				initialPrompt: "/watch",
				starred: true,
				watcher: true,
			}),
		),
	};
});

const configMock = vi.mocked(worktreeConfigFor);

function config(overrides: Partial<ReturnType<typeof worktreeConfigFor>> = {}) {
	configMock.mockReturnValue({
		enabled: true,
		watcher: true,
		trunk: false,
		includeDrafts: false,
		install: true,
		commitBeforeManualChecks: false,
		copy: [],
		...overrides,
	});
}

const liveWatcher = {
	id: "1",
	status: "running",
	cwd: "/git/repo",
	watcher: true,
	starred: true,
} satisfies Partial<Session>;

function context(existing: Session[] = []): TreeSpawnContext {
	const sessions = new Map(existing.map((s) => [s.id, s]));
	return {
		sessions,
		spawnWith: (create, spawnContext) => {
			const session = create("9");
			if (spawnContext?.launchedFrom)
				session.launchedFrom = spawnContext.launchedFrom;
			sessions.set(session.id, session);
			return session.id;
		},
		notify: vi.fn(),
		startHeld: vi.fn(),
	};
}

describe("ensureWatcher", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		config();
	});

	it("spawns a starred watcher in the clone when none is watching it", () => {
		const ctx = context();

		const id = ensureWatcher(ctx, "/git/repo-2");

		expect(id).toBe("9");
		expect(createWatcherSession).toHaveBeenCalledWith("9", "/git/repo");
		const watcher = ctx.sessions.get("9");
		expect(watcher?.cwd).toBe("/git/repo");
		expect(watcher?.worktree).toBeUndefined();
		expect(watcher?.starred).toBe(true);
		expect(watcher?.watcher).toBe(true);
		expect(daemonLog).toHaveBeenCalledWith(
			expect.stringContaining("spawned watcher session 9"),
		);
	});

	it("leaves the watcher top-level, not nested under the run that triggered it", () => {
		const ctx = context();

		ensureWatcher(ctx, "/git/repo-2");

		expect(ctx.sessions.get("9")?.launchedFrom).toBeUndefined();
	});

	it("spawns nothing when a live watcher already holds the clone", () => {
		const ctx = context([makeSession(liveWatcher)]);

		expect(ensureWatcher(ctx, "/git/repo-2")).toBeUndefined();
		expect(createWatcherSession).not.toHaveBeenCalled();
		expect(daemonLog).toHaveBeenCalledWith(
			expect.stringContaining("no watcher spawned for the clone /git/repo"),
		);
	});

	it("replaces a watcher that has stopped or errored", () => {
		for (const status of ["stopped", "error"] as const) {
			vi.clearAllMocks();
			config();
			const ctx = context([makeSession({ ...liveWatcher, status })]);

			expect(ensureWatcher(ctx, "/git/repo")).toBe("9");
			expect(createWatcherSession).toHaveBeenCalledWith("9", "/git/repo");
			expect(daemonLog).toHaveBeenCalledWith(
				expect.stringContaining("spawned watcher session 9"),
			);
		}
	});

	it("ignores a live session in the clone that is not a watcher", () => {
		const ctx = context([makeSession({ ...liveWatcher, watcher: undefined })]);

		expect(ensureWatcher(ctx, "/git/repo")).toBe("9");
	});

	it("ignores a watcher for another clone", () => {
		const ctx = context([makeSession({ ...liveWatcher, cwd: "/git/other" })]);

		expect(ensureWatcher(ctx, "/git/repo")).toBe("9");
	});

	it("does nothing when worktree.watcher is off", () => {
		config({ watcher: false });

		expect(ensureWatcher(context(), "/git/repo")).toBeUndefined();
		expect(createWatcherSession).not.toHaveBeenCalled();
	});

	it("does nothing when worktrees are off", () => {
		config({ enabled: false });

		expect(ensureWatcher(context(), "/git/repo")).toBeUndefined();
		expect(createWatcherSession).not.toHaveBeenCalled();
	});

	it("does nothing without a cwd to resolve the clone from", () => {
		expect(ensureWatcher(context(), undefined)).toBeUndefined();
		expect(configMock).not.toHaveBeenCalled();
	});
});
