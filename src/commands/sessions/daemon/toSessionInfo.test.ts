import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../../test/mocks/fsMock";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { toSessionInfo } from "./toSessionInfo";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../test/mocks/fsMock")
	).fsMock(),
);

const exists = vi.mocked(existsSync);

const finished = {
	commandType: "assist",
	status: "error",
	cwd: "/git/repo-2",
	worktree: { path: "/git/repo-2", clone: "/git/repo" },
} satisfies Partial<Session>;

beforeEach(() => {
	exists.mockReset();
	exists.mockReturnValue(true);
});

describe("toSessionInfo joinable", () => {
	it("ships the daemon's verdict for a finished session with a workspace", () => {
		expect(toSessionInfo(makeSession(finished)).joinable).toBe(true);
	});

	it("ships a refusal for a session whose workspace is gone", () => {
		exists.mockReturnValue(false);
		expect(toSessionInfo(makeSession(finished)).joinable).toBe(false);
	});

	it("ships a refusal for a server run", () => {
		expect(
			toSessionInfo(makeSession({ ...finished, commandType: "run" })).joinable,
		).toBe(false);
	});
});
