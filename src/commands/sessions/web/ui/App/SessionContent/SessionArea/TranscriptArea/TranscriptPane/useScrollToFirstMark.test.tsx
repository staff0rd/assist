// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { TranscriptMessage } from "../../../../../types";
import { useScrollToFirstMark } from "./useScrollToFirstMark";

afterEach(cleanup);

function Pane({ messages }: { messages: TranscriptMessage[] }) {
	const ref = useScrollToFirstMark(messages, "", true);
	return <div data-testid="pane" ref={ref} />;
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
});
