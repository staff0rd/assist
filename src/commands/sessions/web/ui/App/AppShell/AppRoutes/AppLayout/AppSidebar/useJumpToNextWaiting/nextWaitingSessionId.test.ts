import { describe, expect, it } from "vitest";
import { nextWaitingSessionId } from "./nextWaitingSessionId";
import type { SessionInfo, SessionStatus } from "../../../../../../types";

const prPreview = {
	requestId: "r1",
	title: "A PR",
	body: "",
	prNumber: 1,
};

function session(
	id: string,
	status: SessionStatus,
	pendingPrPreview?: SessionInfo["pendingPrPreview"],
): SessionInfo {
	return {
		id,
		name: id,
		commandType: "run",
		status,
		startedAt: 0,
		pendingPrPreview,
	};
}

describe("nextWaitingSessionId", () => {
	it("returns the first waiting session after the active one", () => {
		const sessions = [
			session("a", "waiting"),
			session("b", "running"),
			session("c", "waiting"),
			session("d", "waiting"),
		];

		expect(nextWaitingSessionId(sessions, "b")).toBe("c");
	});

	it("wraps past the end back to the top", () => {
		const sessions = [
			session("a", "waiting"),
			session("b", "running"),
			session("c", "waiting"),
		];

		expect(nextWaitingSessionId(sessions, "c")).toBe("a");
	});

	it("walks every waiting card across repeated presses", () => {
		const sessions = [
			session("a", "waiting"),
			session("b", "running"),
			session("c", "waiting"),
		];

		const first = nextWaitingSessionId(sessions, null);
		const second = nextWaitingSessionId(sessions, first);
		const third = nextWaitingSessionId(sessions, second);

		expect([first, second, third]).toEqual(["a", "c", "a"]);
	});

	it("starts from the top when nothing is selected", () => {
		const sessions = [session("a", "running"), session("b", "waiting")];

		expect(nextWaitingSessionId(sessions, null)).toBe("b");
	});

	it("returns the active session when it is the only waiting one", () => {
		const sessions = [
			session("a", "running"),
			session("b", "waiting"),
			session("c", "done"),
		];

		expect(nextWaitingSessionId(sessions, "b")).toBe("b");
	});

	it("treats a running session holding a PR preview as waiting", () => {
		const sessions = [
			session("a", "running"),
			session("b", "running", prPreview),
		];

		expect(nextWaitingSessionId(sessions, "a")).toBe("b");
	});

	it("returns null when nothing is waiting", () => {
		const sessions = [session("a", "running"), session("b", "done")];

		expect(nextWaitingSessionId(sessions, "a")).toBeNull();
	});

	it("returns null for an empty list", () => {
		expect(nextWaitingSessionId([], null)).toBeNull();
	});

	it("ignores an active id that is no longer in the list", () => {
		const sessions = [session("a", "waiting"), session("b", "waiting")];

		expect(nextWaitingSessionId(sessions, "gone")).toBe("a");
	});
});
