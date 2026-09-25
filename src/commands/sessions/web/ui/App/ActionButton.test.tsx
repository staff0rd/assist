// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActionButton } from "./ActionButton";
import { LabelledActionsContext } from "./useLabelledActionsContext";

afterEach(cleanup);

function renderButton(labelled: boolean, onClick = () => {}) {
	render(
		<LabelledActionsContext.Provider value={labelled}>
			<ActionButton
				label="Retry"
				title="Retry session 7"
				icon={<span data-testid="icon" />}
				onClick={onClick}
			/>
		</LabelledActionsContext.Provider>,
	);
}

describe("ActionButton", () => {
	it("renders icon-only by default", () => {
		render(
			<ActionButton
				label="Retry"
				title="Retry session 7"
				icon={<span data-testid="icon" />}
				onClick={() => {}}
			/>,
		);

		expect(screen.queryByText("Retry")).toBeNull();
		expect(screen.getByTestId("icon")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Retry session 7" }),
		).toBeTruthy();
	});

	it("shows the text label when actions are labelled", () => {
		renderButton(true);

		expect(screen.getByText("Retry")).toBeTruthy();
		expect(screen.getByTestId("icon")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Retry session 7" }),
		).toBeTruthy();
	});

	it("hides the text label again when actions collapse", () => {
		renderButton(false);

		expect(screen.queryByText("Retry")).toBeNull();
		expect(screen.getByTitle("Retry session 7")).toBeTruthy();
	});

	it("invokes the handler in either rendering", () => {
		const onClick = vi.fn();
		renderButton(true, onClick);

		fireEvent.click(screen.getByTitle("Retry session 7"));

		cleanup();
		renderButton(false, onClick);
		fireEvent.click(screen.getByTitle("Retry session 7"));

		expect(onClick).toHaveBeenCalledTimes(2);
	});

	it("falls back to the label for the accessible name", () => {
		render(
			<ActionButton
				label="Stop"
				icon={<span data-testid="icon" />}
				onClick={() => {}}
			/>,
		);

		expect(screen.getByRole("button", { name: "Stop" })).toBeTruthy();
		expect(screen.getByRole("button").getAttribute("title")).toBeNull();
	});
});
