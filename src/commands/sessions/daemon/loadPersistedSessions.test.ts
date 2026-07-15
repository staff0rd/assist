import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadJson, saveJson } from "../../../shared/loadJson";
import type { Session } from "./createSession";
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

const loadJsonMock = loadJson as unknown as ReturnType<typeof vi.fn>;
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
