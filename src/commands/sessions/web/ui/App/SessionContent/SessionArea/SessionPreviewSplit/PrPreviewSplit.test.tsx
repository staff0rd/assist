// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import { PrPreviewSplit } from "./PrPreviewSplit";

function preview(overrides: Partial<PrPreview> = {}): PrPreview {
	return {
		requestId: "req-1",
		title: "org/repo#42 — Review",
		body: "not json",
		prNumber: 42,
		kind: "high-level-review",
		...overrides,
	};
}

let observers: ResizeObserverCallback[] = [];

class TestResizeObserver {
	constructor(private callback: ResizeObserverCallback) {
		observers.push(callback);
	}
	observe() {}
	disconnect() {}
}

function resizeTo(width: number) {
	act(() => {
		for (const callback of observers)
			callback(
				[{ contentRect: { width } } as ResizeObserverEntry],
				{} as ResizeObserver,
			);
	});
}

function terminalStyle() {
	return getComputedStyle(
		screen.getByTestId("terminal").parentElement as HTMLElement,
	);
}

function paneStyle() {
	return getComputedStyle(
		document.querySelector('[aria-hidden="false"]') as HTMLElement,
	);
}

beforeEach(() => {
	observers = [];
	globalThis.ResizeObserver =
		TestResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	Reflect.deleteProperty(globalThis, "ResizeObserver");
});

function renderSplit(value: PrPreview) {
	render(
		<PrPreviewSplit preview={value} onDecision={vi.fn()}>
			<div data-testid="terminal" />
		</PrPreviewSplit>,
	);
	const terminal = screen.getByTestId("terminal").parentElement as HTMLElement;
	return () => getComputedStyle(terminal).width;
}

describe("PrPreviewSplit", () => {
	it.each([
		["high-level-review", preview()],
		["show", preview({ kind: "show", body: "hi" })],
		["ask", preview({ kind: "ask", body: "## Plan", prNumber: null })],
	])("fills the window with the %s pane and returns to half", (_, value) => {
		const terminalWidth = renderSplit(value);
		expect(terminalWidth()).toBe("50%");

		fireEvent.click(screen.getByLabelText("Fill the window with preview"));
		expect(terminalWidth()).toBe("0%");
		expect(
			screen
				.getByLabelText("Show terminal beside preview")
				.getAttribute("aria-pressed"),
		).toBe("true");

		fireEvent.click(screen.getByLabelText("Show terminal beside preview"));
		expect(terminalWidth()).toBe("50%");
	});

	it("sits beside the terminal at 1000px", () => {
		renderSplit(preview());
		resizeTo(1000);
		expect(terminalStyle().width).toBe("50%");
		expect(paneStyle().width).toBe("50%");
		expect(paneStyle().top).toBe("0px");
	});

	it("stacks below the terminal under 1000px and fills on full", () => {
		renderSplit(preview());
		resizeTo(999);
		expect(terminalStyle().height).toBe("50%");
		expect(terminalStyle().width).toBe("100%");
		expect(paneStyle().height).toBe("50%");
		expect(paneStyle().left).toBe("0px");

		fireEvent.click(screen.getByLabelText("Fill the window with preview"));
		expect(terminalStyle().height).toBe("0%");
		expect(paneStyle().height).toBe("100%");

		fireEvent.click(screen.getByLabelText("Show terminal above preview"));
		expect(terminalStyle().height).toBe("50%");
	});

	it("switches layout live when resized across 1000px", () => {
		renderSplit(preview());
		resizeTo(999);
		expect(terminalStyle().height).toBe("50%");
		resizeTo(1200);
		expect(terminalStyle().width).toBe("50%");
		expect(screen.getByLabelText("Fill the window with preview")).toBeTruthy();
	});

	it("snaps both halves without a transition on the frame the layout flips", () => {
		const frames: FrameRequestCallback[] = [];
		vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
			frames.push(cb),
		);
		vi.stubGlobal("cancelAnimationFrame", () => {});
		const flushFrame = () =>
			act(() => {
				for (const cb of frames.splice(0)) cb(0);
			});
		renderSplit(preview());
		resizeTo(1200);
		expect(paneStyle().transition).not.toBe("none");

		resizeTo(999);
		expect(terminalStyle().transition).toBe("none");
		expect(paneStyle().transition).toBe("none");

		flushFrame();
		flushFrame();
		expect(terminalStyle().transition).toContain("height");
		expect(paneStyle().transition).toContain("transform");
	});

	it("stacks a show over the review and keeps the review mounted", () => {
		const onDecision = vi.fn();
		const review = preview();
		const show = preview({
			requestId: "show-1",
			kind: "show",
			title: "Stacked",
			body: "hello",
		});
		const tree = (stackedShow?: PrPreview) => (
			<PrPreviewSplit
				preview={review}
				stackedShow={stackedShow}
				onDecision={onDecision}
			>
				<div />
			</PrPreviewSplit>
		);
		const { rerender } = render(tree());
		const toggle = screen.getByLabelText("Fill the window with preview");

		rerender(tree(show));
		expect(screen.getByText("hello")).toBeTruthy();
		fireEvent.click(screen.getAllByText("Close").at(-1) as HTMLElement);
		expect(onDecision).toHaveBeenCalledWith(
			"show-1",
			"reject",
			expect.anything(),
		);

		rerender(tree());
		expect(screen.queryByText("hello")).toBeNull();
		expect(screen.getByLabelText("Fill the window with preview")).toBe(toggle);
	});
});
