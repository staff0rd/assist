// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { QuestionPane } from "./QuestionPane";

const toggle = vi.hoisted(() => ({ enabled: false }));
vi.mock("./QuestionPane/useAskQuestionAutoSubmit", () => ({
	useAskQuestionAutoSubmit: () => {
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

const threePreviews = {
	question: "Which theme?",
	header: "Theme",
	multiSelect: false,
	options: [
		{ label: "Alpha", description: "First", preview: "ALPHA" },
		{ label: "Beta", description: "Second", preview: "BETA" },
		{ label: "Gamma", description: "Third", preview: "GAMMA" },
	],
};

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

const autoSubmitSwitch = () =>
	screen.getByRole("switch", { name: "Auto submit" });

const answerButton = () =>
	screen.getByRole("button", { name: "Answer" }) as HTMLButtonElement;

describe("QuestionPane", () => {
	it("shows a question's context above the question", () => {
		pane([{ ...questions[0], context: "The list is getting long." }]);
		const context = screen.getByText("The list is getting long.");
		const question = screen.getByText("Which layout?");
		expect(
			context.compareDocumentPosition(question) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("shows nothing extra when a question has no context", () => {
		pane([questions[0]]);
		const legend = screen.getByText("Which layout?").parentElement!;
		expect(legend.children).toHaveLength(2);
	});

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

	describe("auto submit", () => {
		it("switches the preview between options without submitting", () => {
			toggle.enabled = true;
			const onDecision = pane([threePreviews]);

			expect(screen.getByText("ALPHA")).toBeTruthy();
			for (const [label, body] of [
				["Beta", "BETA"],
				["Gamma", "GAMMA"],
				["Alpha", "ALPHA"],
			] as const) {
				const peek = screen.getByRole("button", { name: `Preview ${label}` });
				fireEvent.click(peek);
				expect(screen.getByText(body)).toBeTruthy();
				expect(peek.getAttribute("aria-pressed")).toBe("true");
				expect(screen.getAllByText(label).length).toBe(2);
			}
			fireEvent.mouseEnter(screen.getByRole("radio", { name: /Gamma/ }));
			expect(screen.getByText("GAMMA")).toBeTruthy();

			expect(onDecision).not.toHaveBeenCalled();
			for (const radio of screen.getAllByRole("radio"))
				expect((radio as HTMLInputElement).checked).toBe(false);
		});

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
			fireEvent.click(autoSubmitSwitch());
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

	describe("Enter in Other", () => {
		function typeOther(header: string, value: string) {
			const box = screen.getByRole("textbox", {
				name: `Other answer for ${header}`,
			});
			fireEvent.change(box, { target: { value } });
			return box;
		}

		it("submits when every question is answered", () => {
			const onDecision = pane();
			fireEvent.click(screen.getByRole("radio", { name: /Compact/ }));
			fireEvent.click(screen.getByRole("checkbox", { name: /Other/ }));
			const box = typeOther("Notify", "Build broke");

			expect(fireEvent.keyDown(box, { key: "Enter" })).toBe(false);
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({
					answers: {
						"Which layout?": "Compact",
						"Which events notify?": "Build broke",
					},
				}),
			);
		});

		it("is swallowed while a question is unanswered", () => {
			const onDecision = pane();
			fireEvent.click(screen.getByRole("checkbox", { name: /Other/ }));
			const box = typeOther("Notify", "Build broke");

			expect(fireEvent.keyDown(box, { key: "Enter" })).toBe(false);
			expect(onDecision).not.toHaveBeenCalled();
		});

		it("does not submit during IME composition", () => {
			const onDecision = pane();
			fireEvent.click(screen.getByRole("radio", { name: /Compact/ }));
			fireEvent.click(screen.getByRole("checkbox", { name: /Other/ }));
			const box = typeOther("Notify", "ビルド");

			fireEvent.keyDown(box, { key: "Enter", isComposing: true });
			expect(onDecision).not.toHaveBeenCalled();
		});

		it("leaves Shift+Enter to insert a line break", () => {
			const onDecision = pane();
			fireEvent.click(screen.getByRole("radio", { name: /Compact/ }));
			fireEvent.click(screen.getByRole("checkbox", { name: /Other/ }));
			const box = typeOther("Notify", "line one");

			expect(box.tagName).toBe("TEXTAREA");
			expect(fireEvent.keyDown(box, { key: "Enter", shiftKey: true })).toBe(
				true,
			);
			fireEvent.change(box, { target: { value: "line one\nline two" } });
			expect((box as HTMLTextAreaElement).value).toBe("line one\nline two");
			expect(onDecision).not.toHaveBeenCalled();
		});
	});

	it("rejects on Dismiss", () => {
		const onDecision = pane();
		fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
		expect(onDecision).toHaveBeenCalledWith("reject", expect.anything());
	});
});
