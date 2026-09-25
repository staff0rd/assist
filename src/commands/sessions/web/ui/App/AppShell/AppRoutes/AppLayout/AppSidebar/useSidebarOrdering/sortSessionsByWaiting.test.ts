import { describe, expect, it } from "vitest";
import { sortSessionsByWaiting } from "./sortSessionsByWaiting";
import type { SessionInfo, SessionStatus } from "../../../../../../types";

const NOW = 1_000_000;
const THRESHOLD_MS = 5000;

function session(
	id: string,
	status: SessionStatus = "running",
	waitingSince: number | null = null,
): SessionInfo {
	return {
		id,
		name: id,
		commandType: "run",
		status,
		startedAt: 0,
		waitingSince,
	};
}

function waiting(id: string, waitingForMs: number): SessionInfo {
	return session(id, "waiting", NOW - waitingForMs);
}

function ids(sessions: SessionInfo[]): string[] {
	return sessions.map((s) => s.id);
}

describe("sortSessionsByWaiting", () => {
	it("floats a session waiting past the threshold above the other unstarred sessions", () => {
		const sessions = [session("a"), waiting("b", 6000), session("c")];

		const sorted = sortSessionsByWaiting(
			sessions,
			() => false,
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["b", "a", "c"]);
	});

	it("keeps starred sessions above floated waiters", () => {
		const sessions = [session("a"), waiting("b", 6000), session("c")];
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
		const sessions = [session("a"), waiting("b", 6000), waiting("c", 9000)];
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
			waiting("a", 6000),
			session("b"),
			waiting("c", 30_000),
			waiting("d", 10_000),
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
		const sessions = [session("a"), waiting("b", 4999), session("c")];

		const sorted = sortSessionsByWaiting(
			sessions,
			() => false,
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["a", "b", "c"]);
	});

	it("floats a session that has waited exactly the threshold", () => {
		const sessions = [session("a"), waiting("b", 5000)];

		const sorted = sortSessionsByWaiting(
			sessions,
			() => false,
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["b", "a"]);
	});

	it("ignores a stale waitingSince on a session that is no longer waiting", () => {
		const sessions = [session("a"), session("b", "running", NOW - 60_000)];

		const sorted = sortSessionsByWaiting(
			sessions,
			() => false,
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["a", "b"]);
	});

	it("ignores a waiting session with no waitingSince stamp", () => {
		const sessions = [session("a"), session("b", "waiting")];

		const sorted = sortSessionsByWaiting(
			sessions,
			() => false,
			NOW,
			THRESHOLD_MS,
		);

		expect(ids(sorted)).toEqual(["a", "b"]);
	});

	it("floats on a longer configured threshold only once it is passed", () => {
		const sessions = [session("a"), waiting("b", 12_000), waiting("c", 8000)];

		const sorted = sortSessionsByWaiting(sessions, () => false, NOW, 10_000);

		expect(ids(sorted)).toEqual(["b", "a", "c"]);
	});

	it("floats a briefly waiting session on a shorter configured threshold", () => {
		const sessions = [session("a"), waiting("b", 900)];

		const sorted = sortSessionsByWaiting(sessions, () => false, NOW, 500);

		expect(ids(sorted)).toEqual(["b", "a"]);
	});

	it("floats every waiting session when the threshold is zero", () => {
		const sessions = [session("a"), waiting("b", 0), waiting("c", 1)];

		const sorted = sortSessionsByWaiting(sessions, () => false, NOW, 0);

		expect(ids(sorted)).toEqual(["c", "b", "a"]);
	});

	it("matches the star-only order when nothing has waited past the threshold", () => {
		const sessions = ["a", "b", "c", "d"].map((id) => session(id));
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
