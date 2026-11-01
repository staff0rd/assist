// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { CheckPane } from "./CheckPane";

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

function pane() {
	const onDecision = vi.fn();
	render(<CheckPane preview={preview} onDecision={onDecision} />);
	return onDecision;
}

describe("CheckPane", () => {
	it("shows the title, before chips, numbered steps and a Check chip", () => {
		pane();

		expect(screen.getAllByText("PIN shows on the Mac")).not.toHaveLength(0);
		expect(screen.getByText("Check")).toBeTruthy();
		expect(screen.getByText("Restart both daemons")).toBeTruthy();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
		expect(screen.getByText("assist docs unlock").tagName).toBe("CODE");
	});

	it("sends works in one tap without a note", () => {
		const onDecision = pane();

		fireEvent.click(screen.getByRole("button", { name: "Works" }));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({ answers: { result: "works" } }),
		);
	});

	it("sends doesn't work with the trimmed note", () => {
		const onDecision = pane();

		fireEvent.change(screen.getByRole("textbox", { name: "Note (optional)" }), {
			target: { value: "  PIN showed on work-wsl \n" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Doesn't work" }));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				answers: { result: "doesn't work", note: "PIN showed on work-wsl" },
			}),
		);
	});

	it("rejects when dismissed", () => {
		const onDecision = pane();

		fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

		expect(onDecision).toHaveBeenCalledWith("reject", expect.anything());
	});
});
