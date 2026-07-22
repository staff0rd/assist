import { describe, expect, it } from "vitest";
import { findServingSession, isServing } from "./findServingSession";
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

describe("findServingSession", () => {
	const serving = session({
		id: "run",
		server: true,
		port: 1658,
		remoteOrigin: "host/org/repo",
	});
	const worktree = session({
		id: "wt",
		commandType: "claude",
		remoteOrigin: "host/org/repo",
	});

	it("finds the live server run for an origin across worktrees", () => {
		expect(findServingSession([worktree, serving], "host/org/repo")).toBe(
			serving,
		);
	});

	it("returns undefined when no server serves that origin", () => {
		expect(findServingSession([worktree], "host/org/repo")).toBeUndefined();
	});

	it("returns undefined for a different origin", () => {
		expect(findServingSession([serving], "host/org/other")).toBeUndefined();
	});

	it("returns undefined when origin is unset", () => {
		expect(findServingSession([serving], undefined)).toBeUndefined();
	});

	it("ignores a finished server run", () => {
		const done = session({
			id: "run",
			server: true,
			status: "done",
			remoteOrigin: "host/org/repo",
		});
		expect(findServingSession([done], "host/org/repo")).toBeUndefined();
	});
});
