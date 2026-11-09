import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as adapterModule from "../../../../shared/harnessAdapters/harnessAdapter";
import type { HarnessAdapter } from "../../../../shared/harnessAdapters/types";
import type * as harnessesModule from "../../../../shared/harnesses";
import type { HarnessKind } from "../../../../shared/harnesses";
import { fakeHarnessCalls } from "../../../../test/mocks/fakeHarnessCalls";
import { fakeHarnessMock } from "../../../../test/mocks/fakeHarnessMock";
import type * as fsMockModule from "../../../../test/mocks/fsMock";
import type { Session } from "../createSession";
import { respawnPlan } from "../respawnPlan";
import { spawnClaude } from "../spawnClaude";
import { spawnCodex } from "../spawnCodex";
import { spawnPi } from "../spawnPi";
import { allocateTree } from "./allocateTree";
import type { TreeSpawnContext } from "./allocateAndBind";
import { resumeInTree } from "./resumeInTree";
import { resurfaceOrphanedWorktree } from "./resurfaceOrphanedWorktree";

const env = vi.hoisted(() => ({
	installed: new Set<string>(),
	engine: "claude" as string,
	fake: undefined as HarnessAdapter | undefined,
}));

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../../test/mocks/fsMock")
	).fsMock(),
);
vi.mock("../../../../shared/harnesses", async () => ({
	...(await vi.importActual<typeof harnessesModule>(
		"../../../../shared/harnesses",
	)),
	isHarnessAvailable: (kind: string) => env.installed.has(kind),
}));
vi.mock("../../../../shared/harnessAdapters/harnessAdapter", async () => {
	const actual = await vi.importActual<typeof adapterModule>(
		"../../../../shared/harnessAdapters/harnessAdapter",
	);
	return {
		harnessAdapter: (kind: HarnessKind | undefined) =>
			(kind as string) === "fake" && env.fake
				? env.fake
				: actual.harnessAdapter(kind),
	};
});
vi.mock("../../../../shared/loadConfigFrom", () => ({
	loadConfigFrom: () => ({ harness: { engine: env.engine } }),
}));
vi.mock("../../../../shared/harnessAdapters/carryTranscriptToTree", () => ({
	carryTranscriptToTree: vi.fn(),
}));
vi.mock("../../shared/codex/hasCodexRolloutSync", () => ({
	hasCodexRolloutSync: () => true,
}));
vi.mock("../hasTranscriptOnDisk", () => ({ hasTranscriptOnDisk: () => true }));
vi.mock("../spawnClaude", () => ({ spawnClaude: vi.fn(() => "claude-pty") }));
vi.mock("../spawnCodex", () => ({ spawnCodex: vi.fn(() => "codex-pty") }));
vi.mock("../spawnPi", () => ({ spawnPi: vi.fn(() => "pi-pty") }));
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./readWorktreeRegistry", () => ({
	worktreeAttributionIncludingReaped: () => ({
		clone: "/git/repo",
		origin: "github.com/acme/repo",
	}),
	recordWorktreeHarness: vi.fn(),
}));
vi.mock("./allocateTree", () => ({ allocateTree: vi.fn() }));
vi.mock("./bindNewWorktree", () => ({
	bindNewWorktree: vi.fn(),
	bindResumedWorktree: vi.fn(),
}));
vi.mock("./boundTreeRoots", () => ({ boundTreeRoots: () => new Set() }));
vi.mock("./rearmStoppedSessions", () => ({ armStoppedSession: vi.fn() }));

import { carryTranscriptToTree } from "../../../../shared/harnessAdapters/carryTranscriptToTree";

const existsMock = vi.mocked(existsSync);

function context(): TreeSpawnContext {
	const sessions = new Map<string, Session>();
	return {
		sessions,
		spawnWith: (create) => {
			const session = create("4");
			sessions.set(session.id, session);
			return session.id;
		},
		notify: vi.fn(),
		startHeld: vi.fn(),
	};
}

const spawned = { claude: spawnClaude, codex: spawnCodex, pi: spawnPi };

type Fixture = {
	harness: string;
	identity: Partial<Session>;
	recovers: boolean;
};

const fixtures: Fixture[] = [
	{
		harness: "claude",
		identity: { claudeSessionId: "conv-1" },
		recovers: true,
	},
	{
		harness: "codex",
		identity: { harnessSessionId: "conv-1" },
		recovers: true,
	},
	{ harness: "pi", identity: {}, recovers: false },
	{ harness: "fake", identity: { harnessSessionId: "conv-1" }, recovers: true },
];

describe.each(fixtures)("worktree recovery on $harness", (fixture) => {
	const harness = fixture.harness as HarnessKind;
	let fakeCalls = fakeHarnessCalls();

	beforeEach(() => {
		vi.clearAllMocks();
		fakeCalls = fakeHarnessCalls();
		env.fake = fakeHarnessMock(fakeCalls);
		env.installed = new Set([fixture.harness]);
		env.engine = fixture.harness;
		existsMock.mockImplementation((path) => path !== "/git/repo-7");
		vi.mocked(allocateTree).mockReturnValue({
			cwd: "/git/repo-3",
			kind: "worktree",
			created: true,
			clone: "/git/repo",
		});
	});

	function expectNoOtherHarnessSpawned() {
		for (const [kind, spawn] of Object.entries(spawned))
			if (kind !== fixture.harness) expect(spawn).not.toHaveBeenCalled();
	}

	it("resumes a conversation whose worktree was reaped in a held replacement tree, or refuses before allocating", () => {
		const ctx = context();
		const resume = () =>
			resumeInTree(ctx, "conv-1", "/git/repo-7", "work", harness);

		if (!fixture.recovers) {
			expect(resume).toThrow(
				"Resuming a conversation in a replacement worktree is unavailable on pi",
			);
			expect(allocateTree).not.toHaveBeenCalled();
			expect(ctx.sessions.size).toBe(0);
			return;
		}

		const session = ctx.sessions.get(resume());
		expect(session?.cwd).toBe("/git/repo-3");
		expect(session?.harness).toBe(harness);
		expect(session?.pty).toBeNull();
		expect(session).toEqual(expect.objectContaining(fixture.identity));

		session?.pendingStart?.();

		expectNoOtherHarnessSpawned();
		if (fixture.harness === "fake") {
			expect(fakeCalls.relocate).toEqual([
				["conv-1", "/git/repo-7", "/git/repo-3"],
			]);
			expect(fakeCalls.interactive).toEqual([
				expect.objectContaining({ resumeId: "conv-1", cwd: "/git/repo-3" }),
			]);
			return;
		}
		expect(
			vi.mocked(spawned[fixture.harness as keyof typeof spawned]),
		).toHaveBeenCalledWith(
			expect.objectContaining({
				resumeSessionId: "conv-1",
				cwd: "/git/repo-3",
			}),
		);
		expect(vi.mocked(carryTranscriptToTree).mock.calls.length).toBe(
			fixture.harness === "claude" ? 1 : 0,
		);
	});

	it("resurfaces an orphaned worktree on the harness that worked in it, and restarts it there", () => {
		env.engine = "claude";
		const ctx = context();

		resurfaceOrphanedWorktree(
			ctx.sessions,
			ctx.spawnWith,
			{
				orphan: { path: "/git/repo-3", clone: "/git/repo", harness },
				reason: "uncommitted changes",
				held: { summary: "1 uncommitted file", items: ["a.ts"] },
			},
			vi.fn(),
		);

		const card = ctx.sessions.get("4");
		expect(card?.harness).toBe(harness);
		const plan = card ? respawnPlan(card) : null;
		if (!fixture.recovers) {
			expect(plan).toBeNull();
			return;
		}
		plan?.spawn();
		expectNoOtherHarnessSpawned();
	});
});

describe("orphan resurfacing without a recorded harness", () => {
	it("uses the clone's configured harness rather than assuming Claude", () => {
		env.engine = "codex";
		const ctx = context();

		resurfaceOrphanedWorktree(
			ctx.sessions,
			ctx.spawnWith,
			{
				orphan: { path: "/git/repo-3", clone: "/git/repo" },
				reason: "uncommitted changes",
				held: { summary: "1 uncommitted file", items: ["a.ts"] },
			},
			vi.fn(),
		);

		expect(ctx.sessions.get("4")?.harness).toBe("codex");
	});
});
