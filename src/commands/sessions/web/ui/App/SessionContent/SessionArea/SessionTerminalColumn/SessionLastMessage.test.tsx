// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionLastMessage } from "./SessionLastMessage";

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

const long = "check the parser\n\nthen fix the failing test";

function readout() {
	return screen.getByTestId("session-last-message");
}

function text() {
	return screen.getByTestId("session-last-message-text").textContent;
}

function position() {
	return screen.queryByTestId("session-last-message-position");
}

function wheel(deltaY: number) {
	fireEvent.wheel(readout(), { deltaY });
}

function gesture(deltaY: number) {
	wheel(deltaY);
	vi.advanceTimersByTime(500);
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

		gesture(-100);
		expect(text()).toBe("second");
		gesture(-100);
		gesture(-100);
		expect(text()).toBe("first");
		gesture(100);
		expect(text()).toBe("second");
		gesture(100);
		gesture(100);
		expect(text()).toBe("third");
	});

	it("includes the latest message when the history has not caught up", () => {
		render(<SessionLastMessage message="new" history={["old"]} />);

		gesture(-100);

		expect(text()).toBe("old");
	});

	it("steps once per trackpad gesture however many events it fires", () => {
		render(
			<SessionLastMessage
				message="third"
				history={["first", "second", "third"]}
			/>,
		);

		for (let i = 0; i < 30; i++) {
			wheel(-8);
			vi.advanceTimersByTime(16);
		}

		expect(text()).toBe("second");
	});

	it("shows the position while an older message is showing", () => {
		render(
			<SessionLastMessage
				message="third"
				history={["first", "second", "third"]}
			/>,
		);

		expect(position()).toBeNull();
		gesture(-100);
		expect(position()?.textContent).toBe("2 / 3");
		gesture(-100);
		expect(position()?.textContent).toBe("1 / 3");
		gesture(100);
		gesture(100);
		expect(position()).toBeNull();
	});

	it("returns to the latest message when the pointer leaves", () => {
		render(<SessionLastMessage message="two" history={["one", "two"]} />);

		fireEvent.mouseEnter(readout());
		gesture(-100);
		fireEvent.mouseLeave(readout());

		expect(text()).toBe("two");
		expect(position()).toBeNull();
	});

	it("returns to the latest message when a new message arrives", () => {
		const { rerender } = render(
			<SessionLastMessage message="two" history={["one", "two"]} />,
		);

		gesture(-100);
		rerender(<SessionLastMessage message="three" history={["one", "two"]} />);

		expect(text()).toBe("three");
		expect(position()).toBeNull();
	});

	it("scrolls the text instead of stepping while pinned", () => {
		render(<SessionLastMessage message="two" history={["one", "two"]} />);

		fireEvent.click(readout());
		gesture(-100);

		expect(text()).toBe("two");
		expect(getComputedStyle(readout()).overflow).toBe("hidden auto");
	});

	it("renders nothing without a message", () => {
		render(<SessionLastMessage message="   " />);

		expect(screen.queryByTestId("session-last-message")).toBeNull();
	});
});
