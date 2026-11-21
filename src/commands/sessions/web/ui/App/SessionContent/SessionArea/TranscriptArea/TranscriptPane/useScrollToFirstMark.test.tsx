// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TranscriptMessage } from "../../../../../types";
import { useScrollToFirstMark } from "./useScrollToFirstMark";

const observers = new Set<() => void>();

class FakeResizeObserver {
	constructor(private readonly callback: () => void) {}
	observe() {
		observers.add(this.callback);
	}
	disconnect() {
		observers.delete(this.callback);
	}
}

beforeEach(() => {
	vi.stubGlobal("ResizeObserver", FakeResizeObserver);
});

afterEach(() => {
	cleanup();
	observers.clear();
	vi.unstubAllGlobals();
});

function resize() {
	act(() => {
		for (const callback of observers) callback();
	});
}

function Pane({
	messages,
	term = "",
	follow = true,
}: {
	messages: TranscriptMessage[];
	term?: string;
	follow?: boolean;
}) {
	const ref = useScrollToFirstMark(messages, term, follow);
	return (
		<div data-testid="pane" ref={ref}>
			<div>{term && <mark>{term}</mark>}</div>
		</div>
	);
}

function sized(el: HTMLElement, scrollHeight: number) {
	Object.defineProperty(el, "scrollHeight", {
		configurable: true,
		value: scrollHeight,
	});
	Object.defineProperty(el, "clientHeight", { configurable: true, value: 100 });
}

const rows = (n: number): TranscriptMessage[] =>
	Array.from({ length: n }, (_, i) => ({ role: "assistant", text: `m${i}` }));

describe("useScrollToFirstMark with follow", () => {
	it("keeps following new rows while the reader is at the bottom", () => {
		const { getByTestId, rerender } = render(<Pane messages={rows(1)} />);
		const pane = getByTestId("pane");
		sized(pane, 1000);
		rerender(<Pane messages={rows(2)} />);
		expect(pane.scrollTop).toBe(1000);
	});

	it("leaves the scroll position alone once the reader scrolls up", () => {
		const { getByTestId, rerender } = render(<Pane messages={rows(1)} />);
		const pane = getByTestId("pane");
		sized(pane, 1000);
		pane.scrollTop = 200;
		fireEvent.scroll(pane);
		rerender(<Pane messages={rows(1)} />);
		expect(pane.scrollTop).toBe(200);
		pane.scrollTop = 900;
		fireEvent.scroll(pane);
		rerender(<Pane messages={rows(2)} />);
		expect(pane.scrollTop).toBe(1000);
	});

	it("stays at the bottom when the tail shrinks then grows without new messages", () => {
		const { getByTestId } = render(<Pane messages={rows(1)} />);
		const pane = getByTestId("pane");
		sized(pane, 1000);
		resize();
		expect(pane.scrollTop).toBe(1000);
		sized(pane, 960);
		pane.scrollTop = 860;
		fireEvent.scroll(pane);
		resize();
		expect(pane.scrollTop).toBe(960);
		sized(pane, 1000);
		resize();
		expect(pane.scrollTop).toBe(1000);
	});

	it("does not pull a scrolled-up reader down when content resizes", () => {
		const { getByTestId } = render(<Pane messages={rows(1)} />);
		const pane = getByTestId("pane");
		sized(pane, 1000);
		pane.scrollTop = 200;
		fireEvent.scroll(pane);
		sized(pane, 1200);
		resize();
		expect(pane.scrollTop).toBe(200);
	});
});

describe("useScrollToFirstMark with a search term", () => {
	it("scrolls the first mark into view", () => {
		const scrollIntoView = vi.fn();
		Element.prototype.scrollIntoView = scrollIntoView;
		render(<Pane messages={rows(1)} term="hit" follow={false} />);
		expect(scrollIntoView).toHaveBeenCalledWith({ block: "center" });
	});
});
