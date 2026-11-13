import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveJson } from "../../../shared/loadJson";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import {
	type PersistedSession,
	persistLiveSessions,
} from "./loadPersistedSessions";
import { restoreSession } from "./restoreSession";
import { spawnPty } from "./spawnPty";
import { detectExistingWorktree } from "./worktree/detectExistingWorktree";

vi.mock("../../../shared/loadJson", () => ({
	loadJson: vi.fn(),
	saveJson: vi.fn(),
}));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./assistArgsHarness", () => ({
	assistArgsHarness: vi.fn(() => "claude"),
}));
vi.mock("./spawnPty", () => ({ spawnPty: vi.fn(() => ({ fake: "pty" })) }));
vi.mock("./spawnClaude", () => ({
	spawnClaude: vi.fn(() => ({ fake: "pty" })),
}));
vi.mock("./worktree/detectExistingWorktree", () => ({
	detectExistingWorktree: vi.fn(),
}));

const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;
const saveJsonMock = saveJson as unknown as ReturnType<typeof vi.fn>;
const detectMock = detectExistingWorktree as unknown as ReturnType<
	typeof vi.fn
>;

const tree = { path: "/git/assist-8", clone: "/git/assist" };

const seedingRun: PersistedSession = {
	id: "36",
	name: "assist backlog run a1234",
	commandType: "assist",
	status: "running",
	cwd: tree.path,
	startedAt: 1,
	assistArgs: ["backlog", "run", "a1234"],
	launchedFrom: "35",
	awaitingSeed: true,
};

describe("persistLiveSessions", () => {
	beforeEach(() => vi.clearAllMocks());

	it("persists a session still seeding its worktree", () => {
		const sessions = new Map<string, Session>([
			[
				"36",
				makeSession({
					id: "36",
					status: "running",
					cwd: tree.path,
					pty: null,
					pendingStart: () => null,
					awaitingSeed: true,
				}),
			],
		]);
		persistLiveSessions(sessions);
		expect(saveJsonMock).toHaveBeenCalledWith("sessions.json", [
			expect.objectContaining({ id: "36", awaitingSeed: true }),
		]);
	});
});

describe("restoreSession mid worktree setup", () => {
	beforeEach(() => vi.clearAllMocks());

	it("relaunches the original command held in the same worktree", () => {
		detectMock.mockReturnValue(tree);
		const session = restoreSession("40", seedingRun);
		expect(session).toMatchObject({
			name: seedingRun.name,
			cwd: tree.path,
			assistArgs: seedingRun.assistArgs,
			launchedFrom: "35",
			worktree: tree,
			awaitingSeed: true,
			pty: null,
		});
		expect(spawnPtyMock).not.toHaveBeenCalled();
		session.pendingStart?.();
		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "backlog", "run", "a1234"],
			tree.path,
			"40",
			undefined,
		);
	});

	it("restores as an error card when the worktree is gone", () => {
		detectMock.mockReturnValue(undefined);
		const session = restoreSession("40", seedingRun);
		expect(session.status).toBe("error");
		expect(session.error).toContain("no longer there");
	});
});
