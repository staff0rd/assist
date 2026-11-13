// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AskQuestion } from "../../../shared/askQuestionInputSchema";
import type { PrPreview } from "../../../shared/SessionInfoBase";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import { PhoneQuestionCard } from "./PhoneQuestionCard";

const toggle = vi.hoisted(() => ({ enabled: false }));
vi.mock(
	"../App/SessionContent/PrPreviewSlideInPane/QuestionPane/useAskQuestionAutoSubmit",
	() => ({
		useAskQuestionAutoSubmit: () => {
			const [enabled, setEnabled] = useState(toggle.enabled);
			return [enabled, setEnabled];
		},
	}),
);

afterEach(() => {
	cleanup();
	toggle.enabled = false;
});

const questions = [
	{
		question: "How should I commit?",
		header: "Commit",
		multiSelect: false,
		options: [
			{ label: "One commit", description: "feat", preview: "ONE" },
			{ label: "Split", description: "two commits", preview: "SPLIT" },
		],
	},
	{
		question: "Which checks?",
		header: "Checks",
		multiSelect: true,
		options: [
			{ label: "Lint", description: "" },
			{ label: "Test", description: "" },
		],
	},
];

const singleSelect = [
	questions[0]!,
	{
		question: "Which repo?",
		header: "Repo",
		multiSelect: false,
		options: [
			{ label: "assist", description: "" },
			{ label: "other", description: "" },
		],
	},
];

const previewOf = (qs: AskQuestion[]): PrPreview => ({
	requestId: "r1",
	title: "Claude is asking 2 questions",
	body: JSON.stringify({ questions: qs }),
	prNumber: null,
	kind: "question",
});

function card(qs: AskQuestion[] = questions) {
	const onDecision = vi.fn();
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<PhoneQuestionCard
				preview={previewOf(qs)}
				cwd="/repo"
				keyboardOpen={false}
				onDecision={onDecision}
			/>
		</ThemeProvider>,
	);
	return onDecision;
}

const button = (name: string) =>
	screen.getByRole("button", { name }) as HTMLButtonElement;

describe("PhoneQuestionCard", () => {
	it("shows a question's context above the question", () => {
		card([{ ...questions[0]!, context: "Two features changed." }]);
		const context = screen.getByText("Two features changed.");
		const question = screen.getByText("How should I commit?");
		expect(
			context.compareDocumentPosition(question) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("shows nothing extra when a question has no context", () => {
		card([questions[0]!]);
		const group = screen.getByRole("group", { name: "How should I commit?" });
		expect(group.firstElementChild?.textContent).toBe("How should I commit?");
	});

	it("pages through questions and answers with single, multi and Other", () => {
		const onDecision = card();
		expect(screen.getByText("1 of 2")).toBeTruthy();
		expect(button("Next").disabled).toBe(true);

		fireEvent.click(screen.getByRole("radio", { name: /Split/ }));
		expect(screen.getByTestId("phone-question-preview").textContent).toContain(
			"SPLIT",
		);
		fireEvent.click(button("Next"));

		expect(screen.getByText("2 of 2")).toBeTruthy();
		fireEvent.click(screen.getByRole("checkbox", { name: /Lint/ }));
		fireEvent.click(screen.getByRole("checkbox", { name: /Other/ }));
		fireEvent.change(screen.getByLabelText("Other answer for Checks"), {
			target: { value: "types" },
		});
		fireEvent.click(button("Answer"));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				answers: {
					"How should I commit?": "Split",
					"Which checks?": "Lint, types",
				},
			}),
		);
		expect(button("Sending…").disabled).toBe(true);
	});

	describe("auto submit", () => {
		it("switches the preview between options without submitting", () => {
			toggle.enabled = true;
			const onDecision = card([
				{
					question: "Which theme?",
					header: "Theme",
					multiSelect: false,
					options: [
						{ label: "Alpha", description: "", preview: "ALPHA" },
						{ label: "Beta", description: "", preview: "BETA" },
						{ label: "Gamma", description: "", preview: "GAMMA" },
					],
				},
			]);
			const panel = () => screen.getByTestId("phone-question-preview");

			expect(panel().textContent).toBe("PreviewAlphaALPHA");
			fireEvent.click(button("Preview Beta"));
			expect(panel().textContent).toBe("PreviewBetaBETA");
			fireEvent.click(button("Preview Gamma"));
			expect(panel().textContent).toBe("PreviewGammaGAMMA");
			expect(button("Preview Gamma").getAttribute("aria-pressed")).toBe("true");

			expect(onDecision).not.toHaveBeenCalled();
			for (const radio of screen.getAllByRole("radio"))
				expect((radio as HTMLInputElement).checked).toBe(false);
		});

		it("advances on a pick and submits on the pick that completes the form", () => {
			toggle.enabled = true;
			const onDecision = card(singleSelect);

			fireEvent.click(screen.getByRole("radio", { name: /Split/ }));
			expect(screen.getByText("2 of 2")).toBeTruthy();
			expect(onDecision).not.toHaveBeenCalled();

			fireEvent.click(screen.getByRole("radio", { name: /other/ }));
			expect(onDecision).toHaveBeenCalledOnce();
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({
					answers: { "How should I commit?": "Split", "Which repo?": "other" },
				}),
			);
		});

		it("advances single-select picks but not multi-select ones in a mixed form", () => {
			toggle.enabled = true;
			const onDecision = card();

			fireEvent.click(screen.getByRole("radio", { name: /Split/ }));
			expect(screen.getByText("2 of 2")).toBeTruthy();
			fireEvent.click(screen.getByRole("checkbox", { name: /Lint/ }));
			fireEvent.click(screen.getByRole("checkbox", { name: /Test/ }));
			expect(onDecision).not.toHaveBeenCalled();
			fireEvent.click(button("Answer"));
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({
					answers: {
						"How should I commit?": "Split",
						"Which checks?": "Lint, Test",
					},
				}),
			);
		});

		it("submits a mixed form on the last single-select pick once multi-select is answered", () => {
			toggle.enabled = true;
			const onDecision = card([...questions, singleSelect[1]!]);

			fireEvent.click(screen.getByRole("radio", { name: /One commit/ }));
			expect(screen.getByText("2 of 3")).toBeTruthy();
			fireEvent.click(screen.getByRole("checkbox", { name: /Lint/ }));
			expect(screen.getByText("2 of 3")).toBeTruthy();
			fireEvent.click(button("Next"));
			fireEvent.click(screen.getByRole("radio", { name: /assist/ }));

			expect(onDecision).toHaveBeenCalledOnce();
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({
					answers: {
						"How should I commit?": "One commit",
						"Which checks?": "Lint",
						"Which repo?": "assist",
					},
				}),
			);
		});

		it("leaves picks alone when off", () => {
			const onDecision = card(singleSelect);

			fireEvent.click(screen.getByRole("radio", { name: /Split/ }));
			expect(screen.getByText("1 of 2")).toBeTruthy();
			fireEvent.click(button("Next"));
			fireEvent.click(screen.getByRole("radio", { name: /other/ }));
			expect(onDecision).not.toHaveBeenCalled();
		});

		it("shows a toggle bound to the setting", () => {
			card(singleSelect);
			const toggleSwitch = screen.getByRole("switch", {
				name: "Auto submit",
			}) as HTMLInputElement;
			expect(toggleSwitch.checked).toBe(false);

			fireEvent.click(toggleSwitch);
			fireEvent.click(screen.getByRole("radio", { name: /Split/ }));
			expect(screen.getByText("2 of 2")).toBeTruthy();
		});
	});

	it("dismisses with a reject decision", () => {
		const onDecision = card();
		fireEvent.click(button("Dismiss"));
		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			expect.not.objectContaining({ answers: expect.anything() }),
		);
	});
});
