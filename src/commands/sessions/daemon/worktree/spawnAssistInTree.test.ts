import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import { seedBacklogRunActivity } from "../seedBacklogRunActivity";
import { allocateAndBind } from "./allocateAndBind";
import { spawnAssistInTree, type TreeSpawnContext } from "./spawnInTree";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./allocateAndBind", () => ({ allocateAndBind: vi.fn(() => "4") }));
vi.mock("../createAssistSession", () => ({ createAssistSession: vi.fn() }));
vi.mock("../seedBacklogRunActivity", () => ({
	seedBacklogRunActivity: vi.fn(),
}));

function context(): TreeSpawnContext {
	return {
		sessions: new Map(),
		spawnWith: vi.fn(() => "4"),
		notify: vi.fn(),
		startHeld: vi.fn(),
	};
}

describe("spawnAssistInTree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(allocateAndBind).mockReturnValue("4");
	});

	it("returns the id of the session spawned for a backlog run", () => {
		const id = spawnAssistInTree(
			context(),
			["backlog", "run", "a825"],
			"/git/repo",
			undefined,
		);

		expect(id).toBe("4");
	});

	it("seeds provisional activity on the spawned session", () => {
		const ctx = context();
		const session = { id: "4" } as Session;
		ctx.sessions.set("4", session);

		spawnAssistInTree(ctx, ["backlog", "run", "a825"], "/git/repo", undefined);

		expect(seedBacklogRunActivity).toHaveBeenCalledWith(
			ctx.sessions,
			session,
			ctx.notify,
		);
	});

	it("forwards the launching card to the spawn choke point", () => {
		spawnAssistInTree(context(), ["review", "42"], "/git/repo", undefined, {
			launchedFrom: "2",
		});

		expect(allocateAndBind).toHaveBeenCalledWith(
			expect.anything(),
			"/git/repo",
			expect.any(Function),
			expect.anything(),
			{ launchedFrom: "2" },
		);
	});
});
