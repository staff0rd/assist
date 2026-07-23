import { describe, expect, it } from "vitest";
import { findServingSessions, isServing } from "./findServingSessions";
import type { SessionInfo } from "./types";

function session(
	overrides: Partial<SessionInfo> & { id: string },
): SessionInfo {
	return {
		name: overrides.id,
		commandType: "run",
		status: "running",
		startedAt: 0,
		...overrides,
	};
}

describe("isServing", () => {
	it("is true for a live server run", () => {
		expect(isServing(session({ id: "a", server: true }))).toBe(true);
	});

	it("is false for a non-server run", () => {
		expect(isServing(session({ id: "a" }))).toBe(false);
	});

	it("is false for a finished server run", () => {
		expect(isServing(session({ id: "a", server: true, status: "done" }))).toBe(
			false,
		);
		expect(isServing(session({ id: "a", server: true, status: "error" }))).toBe(
			false,
		);
	});

	it("is false for a non-run command", () => {
		expect(
			isServing(session({ id: "a", server: true, commandType: "claude" })),
		).toBe(false);
	});
});

describe("findServingSessions", () => {
	const servingA = session({
		id: "run-a",
		server: true,
		port: 1658,
		remoteOrigin: "host/org/repo-a",
	});
	const servingB = session({
		id: "run-b",
		server: true,
		port: 1659,
		remoteOrigin: "host/org/repo-b",
	});
	const worktree = session({
		id: "wt",
		commandType: "claude",
		remoteOrigin: "host/org/repo-a",
	});

	it("returns every live server run", () => {
		expect(findServingSessions([worktree, servingA, servingB])).toEqual([
			servingA,
			servingB,
		]);
	});

	it("returns one entry per instance sharing an origin", () => {
		const sibling = session({
			id: "run-a2",
			server: true,
			port: 1660,
			remoteOrigin: "host/org/repo-a",
		});
		expect(findServingSessions([servingA, sibling])).toEqual([
			servingA,
			sibling,
		]);
	});

	it("returns empty when nothing is serving", () => {
		expect(findServingSessions([worktree])).toEqual([]);
	});

	it("ignores a finished server run", () => {
		const done = session({
			id: "run",
			server: true,
			status: "done",
			remoteOrigin: "host/org/repo",
		});
		expect(findServingSessions([done])).toEqual([]);
	});
});
