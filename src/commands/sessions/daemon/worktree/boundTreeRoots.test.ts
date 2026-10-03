import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import { makeSession } from "../../../../test/mothers/makeSession";
import { boundTreeRoots } from "./boundTreeRoots";
import { checkDurabilitySync } from "./treeDurability";
import { worktreeConfigFor } from "./worktreeConfigFor";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../../../shared/findRepoRoot", () => ({
	findRepoRoot: (cwd: string) => cwd,
}));
vi.mock("./worktreeConfigFor", () => ({
	worktreeConfigFor: vi.fn(() => ({ enabled: true, install: true, copy: [] })),
}));
vi.mock("./treeDurability", () => ({
	checkDurabilitySync: vi.fn(() => ({ durable: true })),
}));

const configMock = worktreeConfigFor as unknown as ReturnType<typeof vi.fn>;
const durabilityMock = checkDurabilitySync as unknown as ReturnType<
	typeof vi.fn
>;

function map(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((s) => [s.id, s]));
}

describe("boundTreeRoots", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		configMock.mockReturnValue({ enabled: true, install: true, copy: [] });
		durabilityMock.mockReturnValue({ durable: true });
	});

	it("counts a live session as holding its tree", () => {
		expect(
			boundTreeRoots(map(makeSession({ status: "running", cwd: "/git/repo" }))),
		).toEqual(new Set(["/git/repo"]));
	});

	it("counts a stopped session as holding its tree", () => {
		expect(
			boundTreeRoots(map(makeSession({ status: "stopped", cwd: "/git/repo" }))),
		).toEqual(new Set(["/git/repo"]));
	});

	it("frees the tree of a finished session whose work is landed", () => {
		expect(
			boundTreeRoots(map(makeSession({ status: "done", cwd: "/git/repo" }))),
		).toEqual(new Set());
	});

	it("frees the tree of an errored session whose work is landed", () => {
		expect(
			boundTreeRoots(map(makeSession({ status: "error", cwd: "/git/repo" }))),
		).toEqual(new Set());
	});

	it("keeps holding a finished session's tree while it carries unlanded work", () => {
		durabilityMock.mockReturnValue({
			durable: false,
			reason: "uncommitted changes",
		});

		expect(
			boundTreeRoots(map(makeSession({ status: "done", cwd: "/git/repo" }))),
		).toEqual(new Set(["/git/repo"]));
	});

	it("keeps holding a tree whose teardown is still in flight", () => {
		expect(
			boundTreeRoots(
				map(makeSession({ status: "done", closing: true, cwd: "/git/repo" })),
			),
		).toEqual(new Set(["/git/repo"]));
	});

	it("never probes git when parallel work is off for the repo", () => {
		configMock.mockReturnValue({ enabled: false, install: true, copy: [] });

		expect(
			boundTreeRoots(map(makeSession({ status: "done", cwd: "/git/repo" }))),
		).toEqual(new Set(["/git/repo"]));
		expect(durabilityMock).not.toHaveBeenCalled();
	});

	it("does not re-probe a tree a live session already holds", () => {
		const roots = boundTreeRoots(
			map(
				makeSession({ id: "1", status: "running", cwd: "/git/repo" }),
				makeSession({ id: "2", status: "done", cwd: "/git/repo" }),
			),
		);

		expect(roots).toEqual(new Set(["/git/repo"]));
		expect(durabilityMock).not.toHaveBeenCalled();
	});
});
