// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../../shared/SessionInfoBase";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import { PhoneCheckCard } from "./PhoneCheckCard";

afterEach(cleanup);

const preview: PrPreview = {
	requestId: "r1",
	title: "PIN shows on the Mac",
	body: JSON.stringify({
		title: "PIN shows on the Mac",
		before: ["Restart both daemons"],
		steps: ["Run `assist docs unlock`", "The PIN appears on the Mac"],
		changed: "The docs PIN goes to the controlling node.",
	}),
	prNumber: null,
	kind: "check",
};

function card() {
	const onDecision = vi.fn();
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<PhoneCheckCard
				preview={preview}
				phase="1/2"
				keyboardOpen={false}
				onDecision={onDecision}
			/>
		</ThemeProvider>,
	);
	return onDecision;
}

const button = (name: string) =>
	screen.getByRole("button", { name }) as HTMLButtonElement;

describe("PhoneCheckCard", () => {
	it("shows the phase, title, before chips and steps", () => {
		card();

		expect(screen.getByText("phase 1/2")).toBeTruthy();
		expect(screen.getByText("PIN shows on the Mac")).toBeTruthy();
		expect(screen.getByText("Restart both daemons")).toBeTruthy();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
		expect(screen.getByText("assist docs unlock").tagName).toBe("CODE");
	});

	it("sends works in one tap without a note", () => {
		const onDecision = card();

		fireEvent.click(button("Works"));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({ answers: { result: "works" } }),
		);
		expect(button("Works").disabled).toBe(true);
	});

	it("sends doesn't work with the trimmed note", () => {
		const onDecision = card();

		fireEvent.change(screen.getByRole("textbox", { name: "Note" }), {
			target: { value: "  PIN showed on work-wsl \n" },
		});
		fireEvent.click(button("Doesn't work"));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				answers: { result: "doesn't work", note: "PIN showed on work-wsl" },
			}),
		);
	});
});
