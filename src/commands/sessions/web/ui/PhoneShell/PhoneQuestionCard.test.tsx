// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../../shared/SessionInfoBase";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import { PhoneQuestionCard } from "./PhoneQuestionCard";

afterEach(cleanup);

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

const preview: PrPreview = {
	requestId: "r1",
	title: "Claude is asking 2 questions",
	body: JSON.stringify({ questions }),
	prNumber: null,
	kind: "question",
};

function card() {
	const onDecision = vi.fn();
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<PhoneQuestionCard
				preview={preview}
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

	it("dismisses with a reject decision", () => {
		const onDecision = card();
		fireEvent.click(button("Dismiss"));
		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			expect.not.objectContaining({ answers: expect.anything() }),
		);
	});
});
