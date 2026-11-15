import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type * as makePtyModule from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";

vi.mock("./spawnCodex", async () => {
	const { makePty } = await vi.importActual<typeof makePtyModule>(
		"../../../test/mothers/makePty",
	);
	return { spawnCodex: vi.fn(() => makePty().pty) };
});
vi.mock("../shared/codex/resolveCodexSessionId", () => ({
	resolveCodexSessionId: vi.fn(),
}));
vi.mock("../shared/codex/hasCodexRolloutSync", () => ({
	hasCodexRolloutSync: () => true,
}));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./watchTranscript", () => ({ watchTranscript: vi.fn() }));
vi.mock("./recordBoundPhaseSession", () => ({
	recordBoundPhaseSession: vi.fn(async () => {}),
}));
vi.mock("./rememberSessionTitle", () => ({ rememberSessionTitle: vi.fn() }));

import { resolveCodexSessionId } from "../shared/codex/resolveCodexSessionId";
import { claimConversation } from "./claimedByOthers";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { resumeDiscoveredConversations } from "./resumeDiscoveredConversations";
import { spawnCodex } from "./spawnCodex";

const mockDiscover = resolveCodexSessionId as unknown as MockInstance;
const mockSpawnCodex = spawnCodex as unknown as MockInstance;
const STARTED_AT = 1_000_000;

function unresumable(): Session {
	return makeSession({
		harness: "codex",
		status: "error",
		cwd: "/repo",
		startedAt: STARTED_AT,
		error: "no Codex conversation id was recorded",
		discoverOnRestore: true,
	});
}

async function run(session: Session) {
	const notify = vi.fn();
	resumeDiscoveredConversations({
		sessions: new Map([[session.id, session]]),
		clients: new Set(),
		onStatusChange: vi.fn(),
		notify,
	});
	await vi.waitFor(() => expect(session.discoverOnRestore).toBeUndefined());
	await new Promise((resolve) => setImmediate(resolve));
	return notify;
}

describe("resumeDiscoveredConversations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("resumes the conversation discovery finds instead of leaving an error card", async () => {
		mockDiscover.mockResolvedValue("found-rollout");
		const session = unresumable();

		const notify = await run(session);

		expect(mockDiscover).toHaveBeenCalledWith(
			expect.objectContaining({
				cwd: "/repo",
				launchedAt: STARTED_AT,
				sinceMs: STARTED_AT - 5000,
			}),
		);
		expect(session.harnessSessionId).toBe("found-rollout");
		expect(mockSpawnCodex).toHaveBeenCalledWith(
			expect.objectContaining({ resumeSessionId: "found-rollout" }),
		);
		expect(session.status).toBe("waiting");
		expect(session.error).toBeUndefined();
		expect(notify).toHaveBeenCalled();
	});

	it("excludes conversations claimed by other sessions", async () => {
		claimConversation(
			makeSession({ id: "other", harness: "codex" }),
			"claimed-rollout",
		);
		mockDiscover.mockResolvedValue("claimed-rollout");
		const session = unresumable();

		await run(session);

		expect(mockDiscover.mock.calls[0][0].claimed.has("claimed-rollout")).toBe(
			true,
		);
		expect(mockSpawnCodex).not.toHaveBeenCalled();
		expect(session.status).toBe("error");
	});

	it("leaves the error card and logs it when no conversation is found", async () => {
		mockDiscover.mockResolvedValue(null);
		const session = unresumable();

		await run(session);

		expect(mockSpawnCodex).not.toHaveBeenCalled();
		expect(session.status).toBe("error");
		expect(daemonLog).toHaveBeenCalledWith(
			expect.stringContaining(
				'could not resume restored session "repo/session"',
			),
		);
	});
});
