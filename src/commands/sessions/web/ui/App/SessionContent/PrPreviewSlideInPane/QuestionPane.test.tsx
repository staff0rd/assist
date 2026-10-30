// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { QuestionPane } from "./QuestionPane";

afterEach(cleanup);

const questions = [
	{
		question: "Which layout?",
		header: "Layout",
		multiSelect: false,
		options: [
			{ label: "Compact", description: "One line each", preview: "COMPACT" },
			{ label: "Grouped", description: "By repo", preview: "GROUPED" },
		],
	},
	{
		question: "Which events notify?",
		header: "Notify",
		multiSelect: true,
		options: [
			{ label: "Waiting", description: "Session waiting" },
			{ label: "Merged", description: "PR merged" },
		],
	},
];

const preview: PrPreview = {
	requestId: "r1",
	title: "Claude is asking 2 questions",
	body: JSON.stringify({ questions }),
	prNumber: null,
	kind: "question",
};

function pane() {
	const onDecision = vi.fn();
	render(<QuestionPane preview={preview} onDecision={onDecision} />);
	return onDecision;
}

const answerButton = () =>
	screen.getByRole("button", { name: "Answer" }) as HTMLButtonElement;

describe("QuestionPane", () => {
	it("enables Answer only once every question has an answer", () => {
		pane();
		expect(answerButton().disabled).toBe(true);

		fireEvent.click(screen.getByRole("radio", { name: /Grouped/ }));
		expect(answerButton().disabled).toBe(true);

		fireEvent.click(screen.getByRole("checkbox", { name: /Waiting/ }));
		expect(answerButton().disabled).toBe(false);
	});

	it("returns single, multi and Other answers keyed by question", () => {
		const onDecision = pane();

		fireEvent.click(screen.getByRole("radio", { name: /Compact/ }));
		fireEvent.click(screen.getByRole("radio", { name: /Grouped/ }));
		fireEvent.click(screen.getByRole("checkbox", { name: /Merged/ }));
		fireEvent.click(screen.getByRole("checkbox", { name: /Waiting/ }));
		fireEvent.click(screen.getByRole("checkbox", { name: /Other/ }));
		fireEvent.change(
			screen.getByRole("textbox", { name: "Other answer for Notify" }),
			{ target: { value: "Build broke" } },
		);
		fireEvent.click(answerButton());

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				answers: {
					"Which layout?": "Grouped",
					"Which events notify?": "Waiting, Merged, Build broke",
				},
			}),
		);
	});

	it("shows the selected option's preview beside the options", () => {
		pane();
		expect(screen.getByText("COMPACT")).toBeTruthy();

		fireEvent.click(screen.getByRole("radio", { name: /Grouped/ }));
		expect(screen.getByText("GROUPED")).toBeTruthy();
	});

	it("rejects on Dismiss", () => {
		const onDecision = pane();
		fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
		expect(onDecision).toHaveBeenCalledWith("reject", expect.anything());
	});
});
