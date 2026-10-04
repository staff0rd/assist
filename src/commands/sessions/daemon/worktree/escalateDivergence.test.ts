import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type * as makeSessionModule from "../../../../test/mothers/makeSession";
import { createSession } from "../createSession";
import { daemonLog } from "../daemonLog";
import type { Session } from "../types";
import type { TreeSpawnContext } from "./allocateAndBind";
import { escalateDivergence } from "./escalateDivergence";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./listWorktreePaths", () => ({ mainWorktree: () => "/git/repo" }));
vi.mock("../createSession", async () => {
	const { makeSession } = await vi.importActual<typeof makeSessionModule>(
		"../../../../test/mothers/makeSession",
	);
	return {
		createSession: vi.fn((id: string, opts: { cwd?: string }) =>
			makeSession({ id, status: "running", cwd: opts.cwd }),
		),
	};
});

const createMock = vi.mocked(createSession);
const logMock = vi.mocked(daemonLog);

const output =
	"lap 3: assist watch wait --pull --build\r\npull was not a fast-forward:\r\nfatal: Not possible to fast-forward, aborting.\r\n";

function context(existing: Session[] = []): TreeSpawnContext {
	const sessions = new Map(existing.map((s) => [s.id, s]));
	return {
		sessions,
		spawnWith: (create) => {
			const session = create("9");
			sessions.set(session.id, session);
			return session.id;
		},
		notify: vi.fn(),
		startHeld: vi.fn(),
	};
}

describe("escalateDivergence", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("spawns a claude session in the clone carrying git's reason", () => {
		const ctx = context();

		const id = escalateDivergence(ctx, "/git/repo", output);

		expect(id).toBe("9");
		expect(ctx.sessions.get("9")?.divergenceEscalation).toBe(true);
		const [, opts] = createMock.mock.calls[0];
		expect(opts?.cwd).toBe("/git/repo");
		expect(opts?.prompt).toContain(
			"fatal: Not possible to fast-forward, aborting.",
		);
		expect(opts?.prompt).toContain("Never force-push, `git reset`");
		expect(opts?.prompt).toContain("git rebase @{u}");
		expect(opts?.prompt).toContain("Run /close");
		expect(logMock).toHaveBeenCalledWith(
			expect.stringContaining("spawned escalation session 9"),
		);
	});

	it("returns the live escalation instead of spawning a second one", () => {
		const live = makeSession({
			id: "5",
			status: "running",
			cwd: "/git/repo",
			divergenceEscalation: true,
		});

		expect(escalateDivergence(context([live]), "/git/repo", output)).toBe("5");
		expect(createMock).not.toHaveBeenCalled();
		expect(logMock).toHaveBeenCalledWith(
			expect.stringContaining("no escalation spawned, session 5"),
		);
	});

	it("spawns again once the earlier escalation has finished", () => {
		const finished = makeSession({
			id: "5",
			status: "done",
			cwd: "/git/repo",
			divergenceEscalation: true,
		});

		expect(escalateDivergence(context([finished]), "/git/repo", output)).toBe(
			"9",
		);
	});
});
