import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import type * as fsMockModule from "../../../../test/mocks/fsMock";
import { makeSession } from "../../../../test/mothers/makeSession";
import { joinRefusal } from "./joinRefusal";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../../test/mocks/fsMock")
	).fsMock(),
);

const exists = vi.mocked(existsSync);

const stream = {
	id: "3",
	commandType: "assist",
	status: "running",
	cwd: "/git/repo-2",
	worktree: { path: "/git/repo-2", clone: "/git/repo" },
} satisfies Partial<Session>;

beforeEach(() => {
	exists.mockReset();
	exists.mockReturnValue(true);
});

describe("joinRefusal", () => {
	it("takes another agent into a working session", () => {
		expect(joinRefusal(makeSession(stream))).toBeUndefined();
	});

	it("takes another agent into a finished, errored or stopped session", () => {
		for (const status of ["done", "error", "stopped"] as const)
			expect(joinRefusal(makeSession({ ...stream, status }))).toBeUndefined();
	});

	it("refuses a server run", () => {
		expect(joinRefusal(makeSession({ ...stream, commandType: "run" }))).toBe(
			"a server run has no agent stream",
		);
	});

	it("refuses a session whose workspace is being torn down", () => {
		expect(joinRefusal(makeSession({ ...stream, closing: true }))).toBe(
			"the session is closing",
		);
	});

	it("refuses a session with no working directory", () => {
		expect(
			joinRefusal(
				makeSession({ ...stream, cwd: undefined, worktree: undefined }),
			),
		).toBe("the session has no working directory");
	});

	it("refuses a session whose workspace has been reaped from disk", () => {
		exists.mockReturnValue(false);
		expect(joinRefusal(makeSession(stream))).toBe(
			"the session's workspace no longer exists",
		);
		expect(exists).toHaveBeenCalledWith("/git/repo-2");
	});
});
