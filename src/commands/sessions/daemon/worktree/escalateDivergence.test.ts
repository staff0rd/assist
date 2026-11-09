import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as harnessesModule from "../../../../shared/harnesses";
import type { HarnessKind } from "../../../../shared/harnesses";
import { makeSession } from "../../../../test/mothers/makeSession";
import type * as makeSessionModule from "../../../../test/mothers/makeSession";
import { createSession } from "../createSession";
import { daemonLog } from "../daemonLog";
import type { Session } from "../types";
import type { TreeSpawnContext } from "./allocateAndBind";
import { escalateDivergence } from "./escalateDivergence";

const env = vi.hoisted(() => ({
	engine: "claude" as HarnessKind,
	installed: new Set<string>(["claude", "codex", "pi"]),
	configCwds: [] as string[],
}));

vi.mock("../../../../shared/loadConfigFrom", () => ({
	loadConfigFrom: (cwd: string) => {
		env.configCwds.push(cwd);
		return { harness: { engine: env.engine } };
	},
}));
vi.mock("../../../../shared/harnesses", async () => ({
	...(await vi.importActual<typeof harnessesModule>(
		"../../../../shared/harnesses",
	)),
	isHarnessAvailable: (kind: string) => env.installed.has(kind),
}));
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
		env.engine = "claude";
		env.installed = new Set(["claude", "codex", "pi"]);
		env.configCwds = [];
	});

	it("spawns the escalation on the clone's configured harness, with Claude absent for Codex", () => {
		env.engine = "codex";
		env.installed = new Set(["codex"]);
		const ctx = context();

		expect(escalateDivergence(ctx, "/git/repo", output)).toBe("9");

		expect(env.configCwds).toEqual(["/git/repo"]);
		expect(createMock.mock.calls[0][1]).toEqual(
			expect.objectContaining({ harness: "codex", cwd: "/git/repo" }),
		);
		expect(logMock).toHaveBeenCalledWith(
			expect.stringContaining("spawned Codex escalation session 9"),
		);
	});

	it("refuses before spawning, with the resolver's reasons, when the configured harness is unavailable", () => {
		env.installed = new Set(["codex"]);
		const ctx = context();

		expect(() => escalateDivergence(ctx, "/git/repo", output)).toThrow(
			"Divergence escalation is unavailable on Claude",
		);
		expect(createMock).not.toHaveBeenCalled();
		expect(ctx.sessions.size).toBe(0);
	});

	it("spawns a claude session in the clone carrying git's reason", () => {
		const ctx = context();

		const id = escalateDivergence(ctx, "/git/repo", output);

		expect(id).toBe("9");
		expect(ctx.sessions.get("9")?.divergenceEscalation).toBe(true);
		const [, opts] = createMock.mock.calls[0];
		expect(opts?.cwd).toBe("/git/repo");
		expect(opts?.harness).toBe("claude");
		expect(opts?.prompt).toContain(
			"fatal: Not possible to fast-forward, aborting.",
		);
		expect(opts?.prompt).toContain("Never force-push, `git reset`");
		expect(opts?.prompt).toContain("git rebase @{u}");
		expect(opts?.prompt).toContain("Run /close");
		expect(logMock).toHaveBeenCalledWith(
			expect.stringContaining("spawned Claude escalation session 9"),
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
