import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { sortSessionsByWaiting } from "./sortSessionsByWaiting";
import type { SessionInfo } from "../../../types";

const NOW = 1_000_000;
const THRESHOLD_MS = 5000;

function ids(sessions: SessionInfo[]): string[] {
	return sessions.map((s) => s.id);
}

describe("sortSessionsByWaiting", () => {
	it("floats a session waiting past the threshold above the other unstarred sessions", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({ id: "b", status: "waiting", waitingSince: NOW - 6000 }),
			makeSessionInfo({ id: "c", status: "running" }),
		];

		const sorted = sortSessionsByWaiting(
			sessions,
			() => false,
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["b", "a", "c"]);
	});

	it("keeps starred sessions above floated waiters", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({ id: "b", status: "waiting", waitingSince: NOW - 6000 }),
			makeSessionInfo({ id: "c", status: "running" }),
		];
		const starred = new Set(["c"]);

		const sorted = sortSessionsByWaiting(
			sessions,
			(s) => starred.has(s.id),
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["c", "b", "a"]);
	});

	it("never floats a starred session out of the starred tier", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({ id: "b", status: "waiting", waitingSince: NOW - 6000 }),
			makeSessionInfo({ id: "c", status: "waiting", waitingSince: NOW - 9000 }),
		];
		const starred = new Set(["b"]);

		const sorted = sortSessionsByWaiting(
			sessions,
			(s) => starred.has(s.id),
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["b", "c", "a"]);
	});

	it("orders several floated sessions longest waiting first", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "waiting", waitingSince: NOW - 6000 }),
			makeSessionInfo({ id: "b", status: "running" }),
			makeSessionInfo({
				id: "c",
				status: "waiting",
				waitingSince: NOW - 30_000,
			}),
			makeSessionInfo({
				id: "d",
				status: "waiting",
				waitingSince: NOW - 10_000,
			}),
		];

		const sorted = sortSessionsByWaiting(
			sessions,
			() => false,
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["c", "d", "a", "b"]);
	});

	it("leaves a session waiting less than the threshold in place", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({ id: "b", status: "waiting", waitingSince: NOW - 4999 }),
			makeSessionInfo({ id: "c", status: "running" }),
		];

		const sorted = sortSessionsByWaiting(
			sessions,
			() => false,
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["a", "b", "c"]);
	});

	it("floats a session that has waited exactly the threshold", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({ id: "b", status: "waiting", waitingSince: NOW - 5000 }),
		];

		const sorted = sortSessionsByWaiting(
			sessions,
			() => false,
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["b", "a"]);
	});

	it("ignores a stale waitingSince on a session that is no longer waiting", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({
				id: "b",
				status: "running",
				waitingSince: NOW - 60_000,
			}),
		];

		const sorted = sortSessionsByWaiting(
			sessions,
			() => false,
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["a", "b"]);
	});

	it("ignores a waiting session with no waitingSince stamp", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({ id: "b", status: "waiting", waitingSince: null }),
		];

		const sorted = sortSessionsByWaiting(
			sessions,
			() => false,
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["a", "b"]);
	});

	it("floats on a longer configured threshold only once it is passed", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({
				id: "b",
				status: "waiting",
				waitingSince: NOW - 12_000,
			}),
			makeSessionInfo({ id: "c", status: "waiting", waitingSince: NOW - 8000 }),
		];

		const sorted = sortSessionsByWaiting(sessions, () => false, NOW, 10_000);

		expect(ids(sorted)).toEqual(["b", "a", "c"]);
	});

	it("floats a briefly waiting session on a shorter configured threshold", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({ id: "b", status: "waiting", waitingSince: NOW - 900 }),
		];

		const sorted = sortSessionsByWaiting(sessions, () => false, NOW, 500);

		expect(ids(sorted)).toEqual(["b", "a"]);
	});

	it("floats every waiting session when the threshold is zero", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({ id: "b", status: "waiting", waitingSince: NOW }),
			makeSessionInfo({ id: "c", status: "waiting", waitingSince: NOW - 1 }),
		];

		const sorted = sortSessionsByWaiting(sessions, () => false, NOW, 0);

		expect(ids(sorted)).toEqual(["c", "b", "a"]);
	});

	it("matches the star-only order when nothing has waited past the threshold", () => {
		const sessions = ["a", "b", "c", "d"].map((id) =>
			makeSessionInfo({ id, status: "running" }),
		);
		const starred = new Set(["b", "d"]);

		const sorted = sortSessionsByWaiting(
			sessions,
			(s) => starred.has(s.id),
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["b", "d", "a", "c"]);
	});
});
