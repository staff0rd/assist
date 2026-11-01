// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { QuestionPane } from "./QuestionPane";

const toggle = vi.hoisted(() => ({ enabled: false }));
vi.mock("./QuestionPane/useAskQuestionAutoApprove", () => ({
	useAskQuestionAutoApprove: () => {
		const [enabled, setEnabled] = useState(toggle.enabled);
		return [enabled, setEnabled];
	},
}));

afterEach(() => {
	cleanup();
	toggle.enabled = false;
});

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

const singleSelect = [
	questions[0],
	{
		question: "Which repo?",
		header: "Repo",
		multiSelect: false,
		options: [
			{ label: "assist", description: "This one" },
			{ label: "other", description: "That one" },
		],
	},
];

function pane(asked: unknown[] = questions) {
	const onDecision = vi.fn();
	render(
		<QuestionPane
			preview={{ ...preview, body: JSON.stringify({ questions: asked }) }}
			onDecision={onDecision}
		/>,
	);
	return onDecision;
}

const autoApproveSwitch = () =>
	screen.getByRole("switch", { name: "Auto approve" });

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

	describe("auto approve", () => {
		it("submits on the pick that completes an all single-select form", () => {
			toggle.enabled = true;
			const onDecision = pane(singleSelect);

			fireEvent.click(screen.getByRole("radio", { name: /Compact/ }));
			fireEvent.click(screen.getByRole("radio", { name: /Grouped/ }));
			expect(onDecision).not.toHaveBeenCalled();

			fireEvent.click(screen.getByRole("radio", { name: /other/ }));
			expect(onDecision).toHaveBeenCalledOnce();
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({
					answers: { "Which layout?": "Grouped", "Which repo?": "other" },
				}),
			);
		});

		it("needs Answer when the form has a multi-select question", () => {
			toggle.enabled = true;
			const onDecision = pane();

			fireEvent.click(screen.getByRole("checkbox", { name: /Waiting/ }));
			fireEvent.click(screen.getByRole("radio", { name: /Grouped/ }));
			expect(onDecision).not.toHaveBeenCalled();
			expect(answerButton().disabled).toBe(false);
		});

		it("needs Answer when a question is answered through Other", () => {
			toggle.enabled = true;
			const onDecision = pane(singleSelect);

			fireEvent.click(screen.getAllByRole("radio", { name: /Other/ })[0]!);
			fireEvent.change(
				screen.getByRole("textbox", { name: "Other answer for Layout" }),
				{ target: { value: "Tiled" } },
			);
			fireEvent.click(screen.getByRole("radio", { name: /assist/ }));
			expect(onDecision).not.toHaveBeenCalled();
			expect(answerButton().disabled).toBe(false);
		});

		it("does not submit when turned on with the form already complete", () => {
			const onDecision = pane(singleSelect);

			fireEvent.click(screen.getByRole("radio", { name: /Compact/ }));
			fireEvent.click(screen.getByRole("radio", { name: /assist/ }));
			fireEvent.click(autoApproveSwitch());
			expect(onDecision).not.toHaveBeenCalled();
		});

		it("leaves picks alone when off", () => {
			const onDecision = pane(singleSelect);

			fireEvent.click(screen.getByRole("radio", { name: /Compact/ }));
			fireEvent.click(screen.getByRole("radio", { name: /assist/ }));
			expect(onDecision).not.toHaveBeenCalled();
			expect(answerButton().disabled).toBe(false);
		});
	});

	it("rejects on Dismiss", () => {
		const onDecision = pane();
		fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
		expect(onDecision).toHaveBeenCalledWith("reject", expect.anything());
	});
});
