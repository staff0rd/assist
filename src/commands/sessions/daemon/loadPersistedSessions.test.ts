import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadJson, saveJson } from "../../../shared/loadJson";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import {
	loadPersistedSessions,
	type PersistedSession,
	persistLiveSessions,
	savePersistedSessions,
} from "./loadPersistedSessions";
import { restoreBase } from "./restoreBase";

vi.mock("../../../shared/loadJson", () => ({
	loadJson: vi.fn(),
	saveJson: vi.fn(),
}));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const loadJsonMock = loadJson as unknown as ReturnType<typeof vi.fn>;
const daemonLogMock = daemonLog as unknown as ReturnType<typeof vi.fn>;
const saveJsonMock = saveJson as unknown as ReturnType<typeof vi.fn>;

const validEntry: PersistedSession = {
	name: "assist/Session 1",
	commandType: "claude",
	cwd: "/home/user/repo",
	startedAt: 123,
	claudeSessionId: "abc-123",
};

const NOW = 5000;

function fakeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: NOW,
		waitingSince: null,
		pty: {} as Session["pty"],
		scrollback: "",
		cwd: "/repo",
		...overrides,
	};
}

describe("loadPersistedSessions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns an empty list when the store file is missing", () => {
		loadJsonMock.mockReturnValue({});
		expect(loadPersistedSessions()).toEqual([]);
	});

	it("returns valid entries", () => {
		loadJsonMock.mockReturnValue([validEntry]);
		expect(loadPersistedSessions()).toEqual([validEntry]);
	});

	it("filters out invalid entries", () => {
		loadJsonMock.mockReturnValue([
			validEntry,
			{ name: "missing fields" },
			null,
		]);
		expect(loadPersistedSessions()).toEqual([validEntry]);
	});

	it("logs each entry it drops as unreadable", () => {
		loadJsonMock.mockReturnValue([
			validEntry,
			{ id: "7", name: "half written", cwd: "/repo/tree-7" },
		]);

		loadPersistedSessions();

		expect(daemonLogMock).toHaveBeenCalledWith(
			expect.stringContaining(
				'unreadable persisted session dropped — id=7 name="half written" cwd=/repo/tree-7',
			),
		);
	});
});

describe("savePersistedSessions", () => {
	it("writes to sessions.json", () => {
		savePersistedSessions([validEntry]);
		expect(saveJsonMock).toHaveBeenCalledWith("sessions.json", [validEntry]);
	});
});

describe("persistLiveSessions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("persists only live sessions with a pty", () => {
		const sessions = new Map<string, Session>([
			["1", fakeSession({ id: "1", name: "live", claudeSessionId: "abc" })],
			["2", fakeSession({ id: "2", name: "done", status: "done" })],
			["3", fakeSession({ id: "3", name: "stub", pty: null })],
		]);

		persistLiveSessions(sessions);

		expect(saveJsonMock).toHaveBeenCalledWith("sessions.json", [
			{
				id: "1",
				name: "live",
				commandType: "claude",
				status: "running",
				cwd: "/repo",
				startedAt: 1,
				runningMs: 0,
				claudeSessionId: "abc",
				runName: undefined,
				runArgs: undefined,
				activity: undefined,
			},
		]);
	});

	it("persists a pty-less stopped card so its held work survives a restart", () => {
		const sessions = new Map<string, Session>([
			[
				"1",
				fakeSession({
					name: "repo-2",
					status: "stopped",
					pty: null,
					runningSince: null,
					waitingSince: null,
					cwd: "/repo-2",
					undurable: { reason: "unpushed commits", removesTree: true },
				}),
			],
		]);

		persistLiveSessions(sessions);

		expect(saveJsonMock).toHaveBeenCalledWith("sessions.json", [
			expect.objectContaining({
				name: "repo-2",
				status: "stopped",
				cwd: "/repo-2",
				undurable: { reason: "unpushed commits", removesTree: true },
			}),
		]);
	});

	it("folds the in-flight running stretch into the persisted runningMs", () => {
		const sessions = new Map<string, Session>([
			["1", fakeSession({ runningMs: 1000, runningSince: NOW - 2000 })],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		expect(persisted[0].runningMs).toBe(3000);
	});

	it("persists the frozen runningMs of a session that is not running", () => {
		const sessions = new Map<string, Session>([
			[
				"1",
				fakeSession({ status: "waiting", runningMs: 7000, runningSince: null }),
			],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		expect(persisted[0].runningMs).toBe(7000);
	});

	it("persists a review session's title and subtitle so restore keeps the PR title", () => {
		const sessions = new Map<string, Session>([
			[
				"1",
				fakeSession({
					id: "1",
					name: "assist review 1234",
					title: "fix: something",
					subtitle: "#1234 · alice · 2h ago",
					claudeSessionId: "abc",
				}),
			],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		expect(persisted[0].title).toBe("fix: something");
		expect(persisted[0].subtitle).toBe("#1234 · alice · 2h ago");
	});

	it("persists the session's activity so restore can rehydrate it", () => {
		const sessions = new Map<string, Session>([
			[
				"1",
				fakeSession({
					id: "1",
					name: "backlog",
					claudeSessionId: "abc",
					activity: {
						kind: "backlog",
						itemId: 295,
						itemName: "Fix the thing",
						phase: 2,
						totalPhases: 3,
						startedAt: 5,
					},
				}),
			],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		expect(persisted[0].activity).toEqual({
			kind: "backlog",
			itemId: 295,
			itemName: "Fix the thing",
			phase: 2,
			totalPhases: 3,
			startedAt: 5,
		});
	});

	it("round-trips a starred session through persist, schema parse, and restore", () => {
		const sessions = new Map<string, Session>([
			[
				"1",
				fakeSession({
					id: "1",
					name: "assist review 1234",
					claudeSessionId: "abc",
					starred: true,
				}),
			],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		expect(persisted[0].starred).toBe(true);

		loadJsonMock.mockReturnValue(persisted);
		const [parsed] = loadPersistedSessions();
		expect(parsed.starred).toBe(true);

		expect(restoreBase("1", parsed).starred).toBe(true);
	});

	it("round-trips the watcher flag but drops its persisted star on restore", () => {
		const sessions = new Map<string, Session>([
			[
				"1",
				fakeSession({
					id: "1",
					name: "Session 1",
					claudeSessionId: "abc",
					cwd: "/repo",
					initialPrompt: "/watch",
					watcher: true,
					starred: true,
				}),
			],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		expect(persisted[0]).toMatchObject({ watcher: true, starred: true });

		loadJsonMock.mockReturnValue(persisted);
		const [parsed] = loadPersistedSessions();

		expect(restoreBase("1", parsed)).toMatchObject({
			watcher: true,
			starred: false,
			cwd: "/repo",
		});
	});

	it("leaves an ordinary session unflagged as a watcher after restore", () => {
		const sessions = new Map<string, Session>([
			["1", fakeSession({ id: "1", claudeSessionId: "abc" })],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		loadJsonMock.mockReturnValue(persisted);
		const [parsed] = loadPersistedSessions();

		expect(restoreBase("1", parsed).watcher).toBeUndefined();
	});

	it("round-trips the auto-run, auto-advance and review-started toggles", () => {
		const sessions = new Map<string, Session>([
			[
				"1",
				fakeSession({
					id: "1",
					claudeSessionId: "abc",
					autoRun: true,
					autoAdvance: false,
					reviewStarted: true,
				}),
			],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		expect(persisted[0]).toMatchObject({
			autoRun: true,
			autoAdvance: false,
			reviewStarted: true,
		});

		loadJsonMock.mockReturnValue(persisted);
		const [parsed] = loadPersistedSessions();

		expect(restoreBase("1", parsed)).toMatchObject({
			autoRun: true,
			autoAdvance: false,
			reviewStarted: true,
		});
	});

	it("leaves untouched toggles undefined so their defaults apply after restore", () => {
		const sessions = new Map<string, Session>([
			["1", fakeSession({ id: "1", claudeSessionId: "abc" })],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		loadJsonMock.mockReturnValue(persisted);
		const [parsed] = loadPersistedSessions();
		const restored = restoreBase("1", parsed);

		expect(restored.autoRun).toBeUndefined();
		expect(restored.autoAdvance).toBeUndefined();
		expect(restored.reviewStarted).toBeUndefined();
	});

	it("round-trips the auto and design launch modes so a restart respawns in them", () => {
		const sessions = new Map<string, Session>([
			["1", fakeSession({ id: "1", claudeSessionId: "abc", auto: true })],
			["2", fakeSession({ id: "2", claudeSessionId: "def", design: true })],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		expect(persisted[0]).toMatchObject({ auto: true });
		expect(persisted[1]).toMatchObject({ design: true });

		loadJsonMock.mockReturnValue(persisted);
		const [auto, design] = loadPersistedSessions();

		expect(restoreBase("1", auto).auto).toBe(true);
		expect(restoreBase("2", design).design).toBe(true);
	});

	it("leaves an ordinary session's launch modes undefined after restore", () => {
		const sessions = new Map<string, Session>([
			["1", fakeSession({ id: "1", claudeSessionId: "abc" })],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		loadJsonMock.mockReturnValue(persisted);
		const [parsed] = loadPersistedSessions();
		const restored = restoreBase("1", parsed);

		expect(restored.auto).toBeUndefined();
		expect(restored.design).toBeUndefined();
	});

	it("round-trips the harness through persist, schema parse, and restore", () => {
		const sessions = new Map<string, Session>([
			["1", fakeSession({ id: "1", claudeSessionId: "abc", harness: "pi" })],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		expect(persisted[0].harness).toBe("pi");

		loadJsonMock.mockReturnValue(persisted);
		const [parsed] = loadPersistedSessions();
		expect(parsed.harness).toBe("pi");

		expect(restoreBase("1", parsed).harness).toBe("pi");
	});

	it("defaults an absent harness to undefined so consumers fall back to claude", () => {
		const sessions = new Map<string, Session>([
			["1", fakeSession({ id: "1", claudeSessionId: "abc" })],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		expect(persisted[0].harness).toBeUndefined();
	});

	it("defaults cwd to the process cwd", () => {
		const sessions = new Map<string, Session>([
			["1", fakeSession({ cwd: undefined })],
		]);

		persistLiveSessions(sessions);

		const [, persisted] = saveJsonMock.mock.lastCall as [
			string,
			PersistedSession[],
		];
		expect(persisted[0].cwd).toBe(process.cwd());
	});
});
