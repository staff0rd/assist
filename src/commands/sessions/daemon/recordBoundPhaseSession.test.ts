import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "../../../shared/db/getDb";
import { recordPhaseSession } from "../../../shared/db/recordPhaseSession";
import { loadConfig } from "../../../shared/loadConfig";
import { makeSession } from "../../../test/mothers/makeSession";
import { recordBoundPhaseSession } from "./recordBoundPhaseSession";

vi.mock("../../../shared/db/getDb", () => ({ getDb: vi.fn() }));
vi.mock("../../../shared/db/recordPhaseSession", () => ({
	recordPhaseSession: vi.fn(),
}));
vi.mock("../../../shared/loadConfig", () => ({ loadConfig: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const db = { fake: "db" };

function backlogSession() {
	return makeSession({
		harness: "codex",
		activity: {
			kind: "backlog",
			harness: "codex",
			itemId: 7,
			phase: 3,
			startedAt: 1,
		},
	});
}

describe("recordBoundPhaseSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getDb).mockResolvedValue(db as never);
		vi.mocked(loadConfig).mockReturnValue({
			database: { url: "postgres://x" },
		} as never);
	});

	it("records the bound conversation against the running phase", async () => {
		await recordBoundPhaseSession(backlogSession(), "thread-1");

		expect(recordPhaseSession).toHaveBeenCalledWith(
			db,
			7,
			2,
			"thread-1",
			expect.any(String),
			expect.any(String),
		);
	});

	it("records nothing for a session that is not on a backlog phase", async () => {
		await recordBoundPhaseSession(makeSession({ harness: "codex" }), "t");

		expect(recordPhaseSession).not.toHaveBeenCalled();
	});

	it("records nothing without a database", async () => {
		vi.mocked(loadConfig).mockReturnValue({ database: {} } as never);
		vi.stubEnv("ASSIST_DATABASE_URL", "");

		await recordBoundPhaseSession(backlogSession(), "thread-1");

		vi.unstubAllEnvs();
		expect(recordPhaseSession).not.toHaveBeenCalled();
	});

	it("swallows a failed write", async () => {
		vi.mocked(recordPhaseSession).mockRejectedValue(new Error("down"));

		await expect(
			recordBoundPhaseSession(backlogSession(), "thread-1"),
		).resolves.toBeUndefined();
	});
});
