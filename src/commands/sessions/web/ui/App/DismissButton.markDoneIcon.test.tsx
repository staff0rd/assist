// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DismissButton } from "./DismissButton";
import type { DismissBacklog } from "./DismissButton/useDismissMarkDone";

vi.mock("../../../../backlog/web/ui/api", () => ({
	updateItemStatus: vi.fn(),
}));

afterEach(cleanup);

const BACKLOG: DismissBacklog = {
	target: { itemId: 3, phase: 1, totalPhases: 2 },
	cwd: "/repo",
};

function renderButton(backlog?: DismissBacklog) {
	render(
		<DismissButton
			id="7c1e"
			status="waiting"
			onDismiss={vi.fn()}
			backlog={backlog}
		/>,
	);
	const button = screen.getByRole("button");
	fireEvent.mouseEnter(button);
	return button;
}

const showsCheck = () => screen.queryByTestId("mark-done-icon") !== null;

describe("DismissButton mark-done icon", () => {
	it("swaps to a check while Shift+Ctrl is held over a backlog card", () => {
		const button = renderButton(BACKLOG);

		fireEvent.keyDown(document, {
			key: "Control",
			shiftKey: true,
			ctrlKey: true,
		});
		expect(showsCheck()).toBe(true);

		fireEvent.keyUp(document, { key: "Control", shiftKey: true });
		expect(showsCheck()).toBe(false);

		fireEvent.keyDown(document, {
			key: "Control",
			shiftKey: true,
			ctrlKey: true,
		});
		fireEvent.mouseLeave(button);
		expect(showsCheck()).toBe(false);
	});

	it("needs both modifiers", () => {
		renderButton(BACKLOG);

		fireEvent.keyDown(document, { key: "Shift", shiftKey: true });
		expect(showsCheck()).toBe(false);
	});

	it("keeps the X on a non-backlog card", () => {
		renderButton();

		fireEvent.keyDown(document, {
			key: "Control",
			shiftKey: true,
			ctrlKey: true,
		});
		expect(showsCheck()).toBe(false);
	});
});
