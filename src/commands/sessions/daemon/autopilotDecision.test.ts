import { describe, expect, it } from "vitest";
import type { PrPreview } from "../shared/SessionInfoBase";
import { autopilotDecision } from "./autopilotDecision";

const preview = (fields: Partial<PrPreview>) =>
	({
		requestId: "r",
		title: "t",
		body: "",
		prNumber: null,
		...fields,
	}) as PrPreview;

const questions = (labels: string[]) =>
	JSON.stringify({
		questions: [
			{
				question: "Which?",
				header: "Pick",
				multiSelect: false,
				options: labels.map((label) => ({ label, description: "" })),
			},
		],
	});

describe("autopilotDecision", () => {
	it("approves and starts a backlog proposal", () => {
		expect(
			autopilotDecision(preview({ kind: "backlog-item", canStart: true })),
		).toEqual({ autostart: true });
	});

	it("marks every manual check Works, mid-plan or not", () => {
		expect(autopilotDecision(preview({ kind: "check", body: "{}" }))).toEqual({
			answers: { result: "works" },
		});
	});

	it("approves ask sign-offs and design reviews", () => {
		expect(autopilotDecision(preview({ kind: "ask" }))).toEqual({});
		expect(autopilotDecision(preview({ kind: "design" }))).toEqual({});
	});

	it("answers a question with its Recommended option", () => {
		expect(
			autopilotDecision(
				preview({
					kind: "question",
					body: questions(["A", "B (Recommended)"]),
				}),
			),
		).toEqual({ answers: { "Which?": "B (Recommended)" } });
	});

	it("falls back to the first option when none is Recommended", () => {
		expect(
			autopilotDecision(
				preview({ kind: "question", body: questions(["A", "B"]) }),
			),
		).toEqual({ answers: { "Which?": "A" } });
	});

	it("leaves other previews to the user", () => {
		expect(autopilotDecision(preview({ kind: "pr" }))).toBeUndefined();
	});
});
