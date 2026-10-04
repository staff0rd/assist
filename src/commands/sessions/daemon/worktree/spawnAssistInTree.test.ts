import { beforeEach, describe, expect, it, vi } from "vitest";
import { allocateAndBind } from "./allocateAndBind";
import { spawnAssistInTree, type TreeSpawnContext } from "./spawnInTree";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./allocateAndBind", () => ({ allocateAndBind: vi.fn(() => "4") }));
vi.mock("../createAssistSession", () => ({ createAssistSession: vi.fn() }));

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
