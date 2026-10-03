import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { findServingSessions, isServing } from "./findServingSessions";

describe("isServing", () => {
	it("is true for a live server run", () => {
		expect(
			isServing(
				makeSessionInfo({
					commandType: "run",
					status: "running",
					server: true,
				}),
			),
		).toBe(true);
	});

	it("is false for a non-server run", () => {
		expect(
			isServing(makeSessionInfo({ commandType: "run", status: "running" })),
		).toBe(false);
	});

	it("is false for a finished server run", () => {
		expect(
			isServing(
				makeSessionInfo({ commandType: "run", server: true, status: "done" }),
			),
		).toBe(false);
		expect(
			isServing(
				makeSessionInfo({ commandType: "run", server: true, status: "error" }),
			),
		).toBe(false);
	});

	it("is false for a non-run command", () => {
		expect(
			isServing(
				makeSessionInfo({
					commandType: "claude",
					status: "running",
					server: true,
				}),
			),
		).toBe(false);
	});
});

describe("findServingSessions", () => {
	const servingA = makeSessionInfo({
		id: "run-a",
		commandType: "run",
		status: "running",
		server: true,
		port: 1658,
		remoteOrigin: "host/org/repo-a",
	});
	const servingB = makeSessionInfo({
		id: "run-b",
		commandType: "run",
		status: "running",
		server: true,
		port: 1659,
		remoteOrigin: "host/org/repo-b",
	});
	const worktree = makeSessionInfo({
		id: "wt",
		commandType: "claude",
		status: "running",
		remoteOrigin: "host/org/repo-a",
	});

	it("returns every live server run", () => {
		expect(findServingSessions([worktree, servingA, servingB])).toEqual([
			servingA,
			servingB,
		]);
	});

	it("returns one entry per instance sharing an origin", () => {
		const sibling = makeSessionInfo({
			id: "run-a2",
			commandType: "run",
			status: "running",
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
		const done = makeSessionInfo({
			id: "run",
			commandType: "run",
			server: true,
			status: "done",
			remoteOrigin: "host/org/repo",
		});
		expect(findServingSessions([done])).toEqual([]);
	});
});
