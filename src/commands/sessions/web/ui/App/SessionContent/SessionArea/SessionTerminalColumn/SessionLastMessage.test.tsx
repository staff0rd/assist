// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

	it("requests the history when the message changes", () => {
		const onFetchHistory = vi.fn();
		const { rerender } = render(
			<SessionLastMessage message="one" onFetchHistory={onFetchHistory} />,
		);

		rerender(
			<SessionLastMessage message="two" onFetchHistory={onFetchHistory} />,
		);

		expect(onFetchHistory).toHaveBeenCalledTimes(2);
	});

	it("steps back and forward through the history on the wheel, stopping at each end", () => {
		render(
			<SessionLastMessage
				message="third"
				history={["first", "second", "third"]}
			/>,
		);
		const wheel = (deltaY: number) => fireEvent.wheel(readout(), { deltaY });

		wheel(-100);
		expect(readout().textContent).toBe("second");
		wheel(-100);
		wheel(-100);
		expect(readout().textContent).toBe("first");
		wheel(100);
		expect(readout().textContent).toBe("second");
		wheel(100);
		wheel(100);
		expect(readout().textContent).toBe("third");
	});

	it("includes the latest message when the history has not caught up", () => {
		render(<SessionLastMessage message="new" history={["old"]} />);

		fireEvent.wheel(readout(), { deltaY: -100 });

		expect(readout().textContent).toBe("old");
	});

	it("scrolls the text instead of stepping while pinned", () => {
		render(<SessionLastMessage message="two" history={["one", "two"]} />);

		fireEvent.click(readout());
		fireEvent.wheel(readout(), { deltaY: -100 });

		expect(readout().textContent).toBe("two");
		expect(getComputedStyle(readout()).overflow).toBe("hidden auto");
	});

	it("renders nothing without a message", () => {
		render(<SessionLastMessage message="   " />);

		expect(screen.queryByTestId("session-last-message")).toBeNull();
	});
});
