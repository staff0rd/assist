import { describe, expect, it, vi } from "vitest";
import type * as makePtyModule from "../../../../test/mothers/makePty";
import { makeSession } from "../../../../test/mothers/makeSession";
import type * as makeSessionModule from "../../../../test/mothers/makeSession";
import type { CreateSessionOpts } from "../createSession";
import { createSession, type Session } from "../createSession";
import { spawnIntoStream } from "./spawnIntoStream";
import type { TreeSpawnContext } from "./spawnInTree";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../createSession", async () => {
	const { makeSession } = await vi.importActual<typeof makeSessionModule>(
		"../../../../test/mothers/makeSession",
	);
	const { makePty } = await vi.importActual<typeof makePtyModule>(
		"../../../../test/mothers/makePty",
	);
	return {
		createSession: vi.fn(
			(id: string, { prompt, cwd, holdPty }: CreateSessionOpts = {}) =>
				makeSession({
					id,
					name: prompt ?? `Session ${id}`,
					pty: holdPty ? null : makePty().pty,
					pendingStart: holdPty ? () => null : undefined,
					cwd,
				}),
		),
	};
});

const stream = {
	id: "3",
	commandType: "assist",
	cwd: "/git/repo-2",
	worktree: { path: "/git/repo-2", clone: "/git/repo" },
} satisfies Partial<Session>;

function context(existing: Session[]): {
	ctx: TreeSpawnContext;
	notify: ReturnType<typeof vi.fn>;
} {
	const sessions = new Map(existing.map((s) => [s.id, s]));
	const notify = vi.fn();
	return {
		notify,
		ctx: {
			sessions,
			spawnWith: (create, spawnContext) => {
				const session = create("4");
				if (spawnContext?.launchedFrom)
					session.launchedFrom = spawnContext.launchedFrom;
				sessions.set(session.id, session);
				return session.id;
			},
			notify,
			startHeld: vi.fn(),
		},
	};
}

describe("spawnIntoStream", () => {
	it("adds the agent to the target's workspace without allocating one", () => {
		const target = makeSession(stream);
		const { ctx, notify } = context([target]);

		const id = spawnIntoStream(ctx, target, { prompt: "help with this" });

		const joined = ctx.sessions.get(id);
		expect(joined?.cwd).toBe("/git/repo-2");
		expect(joined?.worktree).toEqual({
			path: "/git/repo-2",
			clone: "/git/repo",
		});
		expect(notify).toHaveBeenCalled();
	});

	it("nests the added agent under the card it was added to", () => {
		const target = makeSession({
			...stream,
			cwd: "/git/repo",
			worktree: undefined,
		});
		const { ctx } = context([target]);

		const id = spawnIntoStream(ctx, target, { prompt: "go" });

		expect(ctx.sessions.get(id)?.launchedFrom).toBe("3");
	});

	it("launches the added agent in auto mode when the launcher asked for it", () => {
		const target = makeSession(stream);
		const { ctx } = context([target]);

		spawnIntoStream(ctx, target, { prompt: "go", auto: true });

		expect(vi.mocked(createSession).mock.calls.at(-1)?.[1]?.auto).toBe(true);
	});

	it("starts the added agent straight away when the workspace is ready", () => {
		const target = makeSession(stream);
		const { ctx } = context([target]);

		const id = spawnIntoStream(ctx, target, { prompt: "go" });

		expect(vi.mocked(createSession).mock.calls[0]?.[1]?.holdPty).toBe(false);
		expect(ctx.sessions.get(id)?.pty).not.toBeNull();
	});

	it("holds the added agent while the target's workspace is still seeding", () => {
		const target = makeSession({
			...stream,
			pty: null,
			pendingStart: () => null,
		});
		const { ctx } = context([target]);

		const id = spawnIntoStream(ctx, target, { prompt: "go" });

		expect(vi.mocked(createSession).mock.calls.at(-1)?.[1]?.holdPty).toBe(true);
		expect(ctx.sessions.get(id)?.pendingStart).toBeDefined();
	});

	it("shares the clone's own tree when the target was never in a worktree", () => {
		const target = makeSession({
			...stream,
			cwd: "/git/repo",
			worktree: undefined,
		});
		const { ctx } = context([target]);

		const id = spawnIntoStream(ctx, target, { prompt: "go" });

		expect(ctx.sessions.get(id)?.cwd).toBe("/git/repo");
		expect(ctx.sessions.get(id)?.worktree).toBeUndefined();
	});
});
