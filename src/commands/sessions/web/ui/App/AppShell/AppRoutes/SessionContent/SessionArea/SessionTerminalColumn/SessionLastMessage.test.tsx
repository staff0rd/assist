// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SessionLastMessage } from "./SessionLastMessage";

afterEach(cleanup);

const long = "check the parser\n\nthen fix the failing test";

function readout() {
	return screen.getByTestId("session-last-message");
}

describe("SessionLastMessage", () => {
	it("shows a single collapsed line until hovered", () => {
		render(<SessionLastMessage message={long} />);

		expect(readout().dataset.expanded).toBe("false");
		expect(readout().textContent).toBe(
			"check the parser then fix the failing test",
		);
		expect(getComputedStyle(readout()).whiteSpace).toBe("nowrap");
	});

	it("expands to the full message on hover and collapses when the pointer leaves", () => {
		render(<SessionLastMessage message={long} />);

		fireEvent.mouseEnter(readout());

		expect(readout().dataset.expanded).toBe("true");
		expect(readout().textContent).toBe(long);
		expect(getComputedStyle(readout()).maxHeight).toBe("50vh");

		fireEvent.mouseLeave(readout());

		expect(readout().dataset.expanded).toBe("false");
	});

	it("does not trap text selection while merely hovered", () => {
		render(<SessionLastMessage message={long} />);

		fireEvent.mouseEnter(readout());

		expect(getComputedStyle(readout()).userSelect).toBe("none");
	});

	it("pins the panel open on click so the text can be selected", () => {
		render(<SessionLastMessage message={long} />);

		fireEvent.mouseEnter(readout());
		fireEvent.click(readout());
		fireEvent.mouseLeave(readout());

		expect(readout().dataset.pinned).toBe("true");
		expect(readout().dataset.expanded).toBe("true");
		expect(readout().textContent).toBe(long);
		expect(getComputedStyle(readout()).userSelect).toBe("text");
	});

	it("stays pinned while the pointer is pressed inside it", () => {
		render(<SessionLastMessage message={long} />);

		fireEvent.click(readout());
		fireEvent.mouseDown(readout());

		expect(readout().dataset.pinned).toBe("true");
	});

	it("unpins on a click away", () => {
		render(<SessionLastMessage message={long} />);

		fireEvent.click(readout());
		fireEvent.mouseDown(document.body);

		expect(readout().dataset.pinned).toBe("false");
		expect(readout().dataset.expanded).toBe("false");
	});

	it("unpins on Escape", () => {
		render(<SessionLastMessage message={long} />);

		fireEvent.click(readout());
		fireEvent.keyDown(document, { key: "Escape" });

		expect(readout().dataset.pinned).toBe("false");
	});

	it("stacks above the terminal's own overlay layers so hover reaches it", () => {
		render(<SessionLastMessage message={long} />);

		expect(Number(getComputedStyle(readout()).zIndex)).toBeGreaterThan(11);

		fireEvent.mouseEnter(readout());

		expect(Number(getComputedStyle(readout()).zIndex)).toBeGreaterThan(11);
	});

	it("renders nothing without a message", () => {
		render(<SessionLastMessage message="   " />);

		expect(screen.queryByTestId("session-last-message")).toBeNull();
	});
});
