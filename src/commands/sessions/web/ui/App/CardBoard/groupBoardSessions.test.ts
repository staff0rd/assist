import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { groupBoardSessions } from "./groupBoardSessions";

const preview = (kind: "question" | "check" | "ask" | "show") => ({
	requestId: `req-${kind}`,
	title: "What next?",
	body: "",
	prNumber: null,
	kind,
});

function ids(list: { id: string }[]) {
	return list.map((s) => s.id);
}

describe("groupBoardSessions", () => {
	it("puts waiting and pending-preview sessions in Needs you", () => {
		const { needsYou } = groupBoardSessions([
			makeSessionInfo({ id: "w", status: "waiting", waitingSince: 1 }),
			makeSessionInfo({
				id: "q",
				status: "running",
				pendingPrPreview: preview("question"),
			}),
			makeSessionInfo({
				id: "c",
				status: "running",
				pendingPrPreview: preview("check"),
			}),
			makeSessionInfo({
				id: "p",
				status: "waiting",
				pendingPrPreview: preview("ask"),
			}),
		]);

		expect(ids(needsYou).sort()).toEqual(["c", "p", "q", "w"]);
	});

	it("puts running sessions with nothing pending in Working", () => {
		const { needsYou, working } = groupBoardSessions([
			makeSessionInfo({ id: "r", status: "running" }),
			makeSessionInfo({
				id: "s",
				status: "running",
				pendingPrPreview: preview("show"),
			}),
		]);

		expect(ids(working)).toEqual(["r", "s"]);
		expect(needsYou).toEqual([]);
	});

	it("leaves server runs out of Working", () => {
		const { working } = groupBoardSessions([
			makeSessionInfo({ id: "srv", status: "running", commandType: "run" }),
		]);

		expect(working).toEqual([]);
	});

	it("leaves error, done, stopped and parked sessions out of both groups", () => {
		const { needsYou, working } = groupBoardSessions(
			(["error", "done", "stopped", "parked"] as const).map((status) =>
				makeSessionInfo({ id: status, status }),
			),
		);

		expect(needsYou).toEqual([]);
		expect(working).toEqual([]);
	});

	it("orders Needs you with the most recently awaiting first", () => {
		const { needsYou } = groupBoardSessions([
			makeSessionInfo({ id: "old", status: "waiting", waitingSince: 1_000 }),
			makeSessionInfo({ id: "new", status: "waiting", waitingSince: 9_000 }),
		]);

		expect(ids(needsYou)).toEqual(["new", "old"]);
	});
});
