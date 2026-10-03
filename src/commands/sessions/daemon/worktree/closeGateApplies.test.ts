import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import { closeGateApplies } from "./closeGateApplies";
import { worktreeConfigFor } from "./worktreeConfigFor";

vi.mock("./worktreeConfigFor", () => ({
	worktreeConfigFor: vi.fn(() => ({ enabled: true, install: true, copy: [] })),
}));

const configMock = worktreeConfigFor as unknown as ReturnType<typeof vi.fn>;

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		waitingSince: null,
		pty: null,
		scrollback: "",
		cwd: "/git/repo",
		...overrides,
	};
}

function map(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((s) => [s.id, s]));
}

describe("closeGateApplies", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		configMock.mockReturnValue({ enabled: true, install: true, copy: [] });
	});

	it("gates a worktree session", () => {
		const s = session({
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});

		expect(closeGateApplies(map(s), s)).toBe(true);
	});

	it("gates a live session in the clone's own tree", () => {
		const s = session();

		expect(closeGateApplies(map(s), s)).toBe(true);
	});

	it("does not gate a clone session that already finished", () => {
		const s = session({ status: "done" });

		expect(closeGateApplies(map(s), s)).toBe(false);
	});

	describe("with worktree mode off", () => {
		beforeEach(() => {
			configMock.mockReturnValue({ enabled: false, install: true, copy: [] });
		});

		it("gates a live session in the clone's own tree", () => {
			const s = session({ status: "waiting" });

			expect(closeGateApplies(map(s), s)).toBe(true);
		});

		it("does not gate a draft kept in the clone", () => {
			const s = session({
				commandType: "assist",
				assistArgs: ["draft", "--once"],
			});

			expect(closeGateApplies(map(s), s)).toBe(false);
		});

		it("does not gate a clone session that already finished", () => {
			const s = session({ status: "done" });

			expect(closeGateApplies(map(s), s)).toBe(false);
		});

		it("does not gate a clone session another card still holds", () => {
			const closing = session({ id: "1" });
			const other = session({ id: "2" });

			expect(closeGateApplies(map(closing, other), closing)).toBe(false);
		});
	});

	it("does not gate a draft kept in the clone", () => {
		const s = session({
			commandType: "assist",
			assistArgs: ["draft", "--once"],
		});

		expect(closeGateApplies(map(s), s)).toBe(false);
	});

	it("gates the run a clone-bound draft chained into", () => {
		const s = session({
			commandType: "assist",
			assistArgs: ["backlog", "run", "7"],
		});

		expect(closeGateApplies(map(s), s)).toBe(true);
	});

	it("does not gate a session whose tree another card still holds", () => {
		const agent = session({
			id: "1",
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const sibling = session({
			id: "2",
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});

		expect(closeGateApplies(map(agent, sibling), agent)).toBe(false);
	});

	it("gates the last card left holding a shared tree", () => {
		const last = session({
			id: "1",
			cwd: "/git/repo-2",
			worktree: { path: "/git/repo-2", clone: "/git/repo" },
		});
		const elsewhere = session({
			id: "2",
			cwd: "/git/repo-3",
			worktree: { path: "/git/repo-3", clone: "/git/repo" },
		});

		expect(closeGateApplies(map(last, elsewhere), last)).toBe(true);
	});
});
