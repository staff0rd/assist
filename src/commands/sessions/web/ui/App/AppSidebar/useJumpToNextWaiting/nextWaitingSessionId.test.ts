import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { nextWaitingSessionId } from "./nextWaitingSessionId";

const prPreview = {
	requestId: "r1",
	title: "A PR",
	body: "",
	prNumber: 1,
};

describe("nextWaitingSessionId", () => {
	it("returns the first waiting session after the active one", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "waiting" }),
			makeSessionInfo({ id: "b", status: "running" }),
			makeSessionInfo({ id: "c", status: "waiting" }),
			makeSessionInfo({ id: "d", status: "waiting" }),
		];

		expect(nextWaitingSessionId(sessions, "b")).toBe("c");
	});

	it("wraps past the end back to the top", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "waiting" }),
			makeSessionInfo({ id: "b", status: "running" }),
			makeSessionInfo({ id: "c", status: "waiting" }),
		];

		expect(nextWaitingSessionId(sessions, "c")).toBe("a");
	});

	it("walks every waiting card across repeated presses", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "waiting" }),
			makeSessionInfo({ id: "b", status: "running" }),
			makeSessionInfo({ id: "c", status: "waiting" }),
		];

		const first = nextWaitingSessionId(sessions, null);
		const second = nextWaitingSessionId(sessions, first);
		const third = nextWaitingSessionId(sessions, second);

		expect([first, second, third]).toEqual(["a", "c", "a"]);
	});

	it("starts from the top when nothing is selected", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({ id: "b", status: "waiting" }),
		];

		expect(nextWaitingSessionId(sessions, null)).toBe("b");
	});

	it("returns the active session when it is the only waiting one", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({ id: "b", status: "waiting" }),
			makeSessionInfo({ id: "c", status: "done" }),
		];

		expect(nextWaitingSessionId(sessions, "b")).toBe("b");
	});

	it("treats a running session holding a PR preview as waiting", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({
				id: "b",
				status: "running",
				pendingPrPreview: prPreview,
			}),
		];

		expect(nextWaitingSessionId(sessions, "a")).toBe("b");
	});

	it("returns null when nothing is waiting", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "running" }),
			makeSessionInfo({ id: "b", status: "done" }),
		];

		expect(nextWaitingSessionId(sessions, "a")).toBeNull();
	});

	it("returns null for an empty list", () => {
		expect(nextWaitingSessionId([], null)).toBeNull();
	});

	it("ignores an active id that is no longer in the list", () => {
		const sessions = [
			makeSessionInfo({ id: "a", status: "waiting" }),
			makeSessionInfo({ id: "b", status: "waiting" }),
		];

		expect(nextWaitingSessionId(sessions, "gone")).toBe("a");
	});
});
