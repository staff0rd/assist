import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import { closeGateApplies } from "./closeGateApplies";
import { worktreeConfigFor } from "./worktreeConfigFor";

vi.mock("./worktreeConfigFor", () => ({
	worktreeConfigFor: vi.fn(() => ({ enabled: true, install: true, copy: [] })),
}));

const configMock = worktreeConfigFor as unknown as ReturnType<typeof vi.fn>;

const inClone = {
	id: "1",
	commandType: "claude",
	status: "running",
	cwd: "/git/repo",
} satisfies Partial<Session>;

const inTree = {
	...inClone,
	cwd: "/git/repo-2",
	worktree: { path: "/git/repo-2", clone: "/git/repo" },
} satisfies Partial<Session>;

function map(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((s) => [s.id, s]));
}

describe("closeGateApplies", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		configMock.mockReturnValue({ enabled: true, install: true, copy: [] });
	});

	it("gates a worktree session", () => {
		const s = makeSession(inTree);

		expect(closeGateApplies(map(s), s)).toBe(true);
	});

	it("gates a live session in the clone's own tree", () => {
		const s = makeSession(inClone);

		expect(closeGateApplies(map(s), s)).toBe(true);
	});

	it("does not gate a clone session that already finished", () => {
		const s = makeSession({ ...inClone, status: "done" });

		expect(closeGateApplies(map(s), s)).toBe(false);
	});

	describe("with worktree mode off", () => {
		beforeEach(() => {
			configMock.mockReturnValue({ enabled: false, install: true, copy: [] });
		});

		it("gates a live session in the clone's own tree", () => {
			const s = makeSession({ ...inClone, status: "waiting" });

			expect(closeGateApplies(map(s), s)).toBe(true);
		});

		it("does not gate a draft kept in the clone", () => {
			const s = makeSession({
				...inClone,
				commandType: "assist",
				assistArgs: ["draft", "--once"],
			});

			expect(closeGateApplies(map(s), s)).toBe(false);
		});

		it("does not gate a clone session that already finished", () => {
			const s = makeSession({ ...inClone, status: "done" });

			expect(closeGateApplies(map(s), s)).toBe(false);
		});

		it("does not gate a clone session another card still holds", () => {
			const closing = makeSession({ ...inClone, id: "1" });
			const other = makeSession({ ...inClone, id: "2" });

			expect(closeGateApplies(map(closing, other), closing)).toBe(false);
		});
	});

	it("does not gate a draft kept in the clone", () => {
		const s = makeSession({
			...inClone,
			commandType: "assist",
			assistArgs: ["draft", "--once"],
		});

		expect(closeGateApplies(map(s), s)).toBe(false);
	});

	it("gates the run a clone-bound draft chained into", () => {
		const s = makeSession({
			...inClone,
			commandType: "assist",
			assistArgs: ["backlog", "run", "7"],
		});

		expect(closeGateApplies(map(s), s)).toBe(true);
	});

	it("does not gate a session whose tree another card still holds", () => {
		const agent = makeSession({ ...inTree, id: "1" });
		const sibling = makeSession({ ...inTree, id: "2" });

		expect(closeGateApplies(map(agent, sibling), agent)).toBe(false);
	});

	it("gates the last card left holding a shared tree", () => {
		const last = makeSession({ ...inTree, id: "1" });
		const elsewhere = makeSession({
			...inClone,
			id: "2",
			cwd: "/git/repo-3",
			worktree: { path: "/git/repo-3", clone: "/git/repo" },
		});

		expect(closeGateApplies(map(last, elsewhere), last)).toBe(true);
	});
});
