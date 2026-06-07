import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadJson, saveJson } from "../../../shared/loadJson";
import type { Session } from "./createSession";
import {
	loadPersistedSessions,
	type PersistedSession,
	persistLiveSessions,
	savePersistedSessions,
} from "./loadPersistedSessions";

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

function fakeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		pty: {} as Session["pty"],
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
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
				cwd: "/repo",
				startedAt: 1,
				claudeSessionId: "abc",
				runName: undefined,
				runArgs: undefined,
			},
		]);
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
