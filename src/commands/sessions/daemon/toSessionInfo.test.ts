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

describe("toSessionInfo promptIssue", () => {
	it("ships the issue a Next view launch prompt names", () => {
		const info = toSessionInfo(
			makeSession({
				commandType: "claude",
				initialPrompt: "Issue o/r#4: Go\nurl",
			}),
		);
		expect(info.promptIssue).toBe("o/r#4");
	});
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

describe("toSessionInfo sdk", () => {
	it("reports a held driven start as an sdk session before its process exists", () => {
		const info = toSessionInfo(
			makeSession({ pty: null, pendingStart: () => null, drivenStart: true }),
		);

		expect(info.sdk).toBe(true);
	});

	it("leaves a held terminal start without the sdk flag", () => {
		const info = toSessionInfo(
			makeSession({ pty: null, pendingStart: () => null }),
		);

		expect(info.sdk).toBeUndefined();
	});

	it("drops the sdk flag once a held driven start fails without a process", () => {
		const info = toSessionInfo(makeSession({ pty: null, drivenStart: true }));

		expect(info.sdk).toBeUndefined();
	});
});
