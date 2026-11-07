import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadJson, saveJson } from "../../../shared/loadJson";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import {
	loadPersistedSessions,
	persistLiveSessions,
} from "./loadPersistedSessions";
import { respawnPlan } from "./respawnPlan";
import { restoreSession } from "./restoreSession";
import { spawnPty } from "./spawnPty";

vi.mock("../../../shared/loadJson", () => ({
	loadJson: vi.fn(),
	saveJson: vi.fn(),
}));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./spawnPty", () => ({ spawnPty: vi.fn(() => ({ fake: "pty" })) }));
vi.mock("./hasTranscriptOnDisk", () => ({
	hasTranscriptOnDisk: vi.fn(() => true),
}));

const loadJsonMock = loadJson as unknown as ReturnType<typeof vi.fn>;
const saveJsonMock = saveJson as unknown as ReturnType<typeof vi.fn>;
const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;

function errored(): Session {
	return makeSession({
		id: "2",
		name: "assist-3/Run backlog a1412",
		commandType: "assist",
		status: "error",
		pty: null,
		cwd: "/repo/assist-3",
		claudeSessionId: "abc-123",
		assistArgs: ["backlog", "run", "a1412"],
		activity: { kind: "backlog", itemId: 1412, startedAt: 1 },
		error: "exited with code 1",
	});
}

function persistAndReload() {
	persistLiveSessions(new Map([["2", errored()]]));
	const [, written] = saveJsonMock.mock.lastCall as [string, unknown[]];
	loadJsonMock.mockReturnValue(structuredClone(written));
	return loadPersistedSessions();
}

describe("errored session across a daemon restart", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("is written to sessions.json with its name, command, item and conversation id", () => {
		expect(persistAndReload()).toEqual([
			expect.objectContaining({
				name: "assist-3/Run backlog a1412",
				status: "error",
				error: "exited with code 1",
				claudeSessionId: "abc-123",
				assistArgs: ["backlog", "run", "a1412"],
				activity: { kind: "backlog", itemId: 1412, startedAt: 1 },
			}),
		]);
	});

	it("restores as its original error card without spawning", () => {
		const [persisted] = persistAndReload();

		const session = restoreSession("5", persisted);

		expect(spawnPtyMock).not.toHaveBeenCalled();
		expect(session).toMatchObject({
			name: "assist-3/Run backlog a1412",
			status: "error",
			error: "exited with code 1",
			cwd: "/repo/assist-3",
			claudeSessionId: "abc-123",
			assistArgs: ["backlog", "run", "a1412"],
			activity: { kind: "backlog", itemId: 1412, startedAt: 1 },
		});
	});

	it("resumes the original transcript when the restored card is restarted", () => {
		const [persisted] = persistAndReload();
		const session = restoreSession("5", persisted);

		respawnPlan(session)?.spawn();

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "backlog", "run", "a1412", "--resume-session", "abc-123"],
			"/repo/assist-3",
			"5",
			undefined,
		);
	});
});
