import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { SessionClient } from "./broadcast";
import { PrPreviewCoordinator } from "./PrPreviewCoordinator";

const yolo = vi.hoisted(() => ({ on: true }));
vi.mock("./yoloEnabled", () => ({ yoloEnabled: () => yolo.on }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function makeClient(): SessionClient & { sent: Record<string, unknown>[] } {
	const sent: Record<string, unknown>[] = [];
	return { sent, send: (data: string) => sent.push(JSON.parse(data)) };
}

function question(label: string, other: string, multiSelect = false) {
	return {
		question: `Pick ${label}?`,
		header: "Pick",
		multiSelect,
		options: [
			{ label, description: "" },
			{ label: other, description: "" },
		],
	};
}

function preview(questions: unknown[], kind = "question") {
	return {
		type: "pr-preview",
		sessionId: "1",
		requestId: "r1",
		title: "Question",
		body: JSON.stringify({ questions }),
		prNumber: null,
		kind,
	};
}

function run(d: Record<string, unknown>, yoloSession = false) {
	const session = makeSession({
		id: "1",
		cwd: "/repo",
		...(yoloSession && { yolo: true }),
	});
	const coord = new PrPreviewCoordinator(new Map([["1", session]]), vi.fn());
	const waiter = makeClient();
	coord.set(waiter, d);
	return { session, waiter };
}

describe("yoloAnswerPreview", () => {
	beforeEach(() => {
		yolo.on = true;
	});

	it("answers every question with its Recommended option", () => {
		const { session, waiter } = run(
			preview([
				question("A (Recommended)", "B"),
				question("C", "D (Recommended)"),
			]),
		);
		expect(session.pendingPrPreview).toBeUndefined();
		expect(waiter.sent).toEqual([
			expect.objectContaining({
				type: "pr-decision",
				requestId: "r1",
				decision: "approve",
				yolo: true,
				answers: {
					"Pick A (Recommended)?": "A (Recommended)",
					"Pick C?": "D (Recommended)",
				},
			}),
		]);
	});

	it("leaves a form with a multi-select question for the user", () => {
		const { session, waiter } = run(
			preview([
				question("A (Recommended)", "B"),
				question("C (Recommended)", "D", true),
			]),
		);
		expect(session.pendingPrPreview?.requestId).toBe("r1");
		expect(waiter.sent).toEqual([]);
	});

	it("leaves a form with a question lacking a Recommended option for the user", () => {
		const { session, waiter } = run(
			preview([question("A (Recommended)", "B"), question("C", "D")]),
		);
		expect(session.pendingPrPreview?.requestId).toBe("r1");
		expect(waiter.sent).toEqual([]);
	});

	it("does nothing when yolo is off", () => {
		yolo.on = false;
		const { session, waiter } = run(
			preview([question("A (Recommended)", "B")]),
		);
		expect(session.pendingPrPreview?.requestId).toBe("r1");
		expect(waiter.sent).toEqual([]);
	});

	it("answers for a yolo session when yolo is off for the repo", () => {
		yolo.on = false;
		const { session, waiter } = run(
			preview([question("A (Recommended)", "B")]),
			true,
		);
		expect(session.pendingPrPreview).toBeUndefined();
		expect(waiter.sent).toEqual([
			expect.objectContaining({
				type: "pr-decision",
				yolo: true,
				answers: { "Pick A (Recommended)?": "A (Recommended)" },
			}),
		]);
	});

	it("ignores non-question previews", () => {
		const { session, waiter } = run(
			preview([question("A (Recommended)", "B")], "ask"),
		);
		expect(session.pendingPrPreview?.requestId).toBe("r1");
		expect(waiter.sent).toEqual([]);
	});

	describe("checks", () => {
		function check(laterPhases?: unknown[]) {
			return {
				...preview([], "check"),
				title: "Check",
				body: JSON.stringify({
					title: "It works",
					steps: ["Do it"],
					...(laterPhases ? { laterPhases } : {}),
				}),
			};
		}

		it("marks a mid-plan check Works", () => {
			const { session, waiter } = run(check([{ number: 3, name: "Review" }]));
			expect(session.pendingPrPreview).toBeUndefined();
			expect(waiter.sent).toEqual([
				expect.objectContaining({
					type: "pr-decision",
					requestId: "r1",
					decision: "approve",
					yolo: true,
					answers: { result: "works" },
				}),
			]);
		});

		it("marks a mid-plan check Works for a yolo session when yolo is off", () => {
			yolo.on = false;
			const { session, waiter } = run(
				check([{ number: 3, name: "Review" }]),
				true,
			);
			expect(session.pendingPrPreview).toBeUndefined();
			expect(waiter.sent).toEqual([
				expect.objectContaining({ answers: { result: "works" } }),
			]);
		});

		it("leaves a Review-phase check with no later phases for the user", () => {
			const { session, waiter } = run(check([]));
			expect(session.pendingPrPreview?.requestId).toBe("r1");
			expect(waiter.sent).toEqual([]);
		});

		it("leaves an ad-hoc check for the user", () => {
			const { session, waiter } = run(check());
			expect(session.pendingPrPreview?.requestId).toBe("r1");
			expect(waiter.sent).toEqual([]);
		});

		it("leaves a mid-plan check for the user when yolo is off", () => {
			yolo.on = false;
			const { session, waiter } = run(check([{ number: 3, name: "Review" }]));
			expect(session.pendingPrPreview?.requestId).toBe("r1");
			expect(waiter.sent).toEqual([]);
		});
	});
});
