import { execFileSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	realpathSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import { allocateAndBind, type TreeSpawnContext } from "./allocateAndBind";
import { planReuseTree } from "./planReuseTree";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./seedWorktree", () => ({ seedWorktree: vi.fn() }));

const created: string[] = [];

afterEach(() => {
	for (const base of created.splice(0))
		rmSync(base, { recursive: true, force: true });
});

function makeRepo(): { base: string; clone: string } {
	const base = realpathSync(mkdtempSync(join(tmpdir(), "clone-collision-")));
	created.push(base);
	const real = join(base, "real");
	const clone = join(real, "myrepo");
	mkdirSync(clone, { recursive: true });
	const git = (...args: string[]) => execFileSync("git", args, { cwd: clone });
	git("init", "-b", "main");
	git("config", "user.email", "test@example.com");
	git("config", "user.name", "test");
	writeFileSync(join(clone, "README.md"), "x");
	git("add", ".");
	git("commit", "-m", "init");
	mkdirSync(join(clone, ".claude"));
	writeFileSync(
		join(clone, ".claude", "assist.yml"),
		"worktree:\n  enabled: true\n  trunk: false\n  install: false\n",
	);
	symlinkSync(real, join(base, "link"));
	return { base, clone };
}

function ctxHolding(...held: Session[]): TreeSpawnContext {
	const sessions = new Map(held.map((s) => [s.id, s]));
	return {
		sessions,
		spawnWith: (create) => {
			const spawned = create(String(sessions.size + 1));
			sessions.set(spawned.id, spawned);
			return spawned.id;
		},
		notify: vi.fn(),
		startHeld: vi.fn(),
	};
}

function spawnInto(ctx: TreeSpawnContext, cwd: string): Session {
	const id = allocateAndBind(ctx, cwd, (sid, resolvedCwd) =>
		makeSession({ id: sid, status: "waiting", cwd: resolvedCwd ?? cwd }),
	);
	return ctx.sessions.get(id) as Session;
}

describe("a second session colliding with a held clone", () => {
	it("is allocated a worktree rather than the clone", () => {
		const { clone } = makeRepo();
		const ctx = ctxHolding(
			makeSession({ id: "1", status: "waiting", cwd: clone }),
		);

		const second = spawnInto(ctx, clone);

		expect(second.cwd).toBe(`${clone}-2`);
		expect(second.worktree).toEqual({ path: `${clone}-2`, clone });
	});

	it("spills a third session into a further worktree", () => {
		const { clone } = makeRepo();
		const ctx = ctxHolding(
			makeSession({ id: "1", status: "waiting", cwd: clone }),
		);

		spawnInto(ctx, clone);
		const third = spawnInto(ctx, clone);

		expect(third.cwd).toBe(`${clone}-3`);
	});

	it("recognises the held clone through a symlinked cwd", () => {
		const { base, clone } = makeRepo();
		const ctx = ctxHolding(
			makeSession({
				id: "1",
				status: "waiting",
				cwd: join(base, "link", "myrepo"),
			}),
		);

		expect(spawnInto(ctx, clone).cwd).toBe(`${clone}-2`);
	});

	it("recognises the held clone through a trailing-slash cwd", () => {
		const { clone } = makeRepo();
		const ctx = ctxHolding(
			makeSession({ id: "1", status: "waiting", cwd: `${clone}/` }),
		);

		expect(spawnInto(ctx, clone).cwd).toBe(`${clone}-2`);
	});

	it("recognises the held clone from a subdirectory spawn", () => {
		const { clone } = makeRepo();
		const ctx = ctxHolding(
			makeSession({ id: "1", status: "waiting", cwd: clone }),
		);

		expect(spawnInto(ctx, join(clone, ".claude")).cwd).toBe(`${clone}-2`);
	});

	it("keeps the clone when nothing else holds it", () => {
		const { clone } = makeRepo();
		const ctx = ctxHolding();

		expect(spawnInto(ctx, clone).cwd).toBe(clone);
	});
});

describe("a chained run reusing a card that shares the clone", () => {
	it("moves the reused card into a worktree", () => {
		const { clone } = makeRepo();
		const reused = makeSession({ id: "1", status: "waiting", cwd: clone });
		const ctx = ctxHolding(
			reused,
			makeSession({ id: "2", status: "waiting", cwd: clone }),
		);

		expect(planReuseTree(reused, ctx)?.cwd).toBe(`${clone}-2`);
	});

	it("recognises the other holder through a symlinked cwd", () => {
		const { base, clone } = makeRepo();
		const reused = makeSession({ id: "1", status: "waiting", cwd: clone });
		const ctx = ctxHolding(
			reused,
			makeSession({
				id: "2",
				status: "waiting",
				cwd: join(base, "link", "myrepo"),
			}),
		);

		expect(planReuseTree(reused, ctx)?.cwd).toBe(`${clone}-2`);
	});

	it("leaves the reused card in the clone when it is the only holder", () => {
		const { clone } = makeRepo();
		const reused = makeSession({ id: "1", status: "waiting", cwd: clone });

		expect(planReuseTree(reused, ctxHolding(reused))).toBeUndefined();
	});
});
