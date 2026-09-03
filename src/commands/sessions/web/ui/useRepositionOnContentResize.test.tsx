// @vitest-environment jsdom
import type { PopoverActions } from "@mui/material";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRepositionOnContentResize } from "./useRepositionOnContentResize";

let resize: (() => void) | undefined;
let observed: Element[] = [];
let disconnected = 0;

class StubResizeObserver {
	constructor(callback: () => void) {
		resize = callback;
	}
	observe(element: Element) {
		observed.push(element);
	}
	disconnect() {
		disconnected += 1;
	}
	unobserve() {}
}

function setup(open: boolean) {
	vi.stubGlobal("ResizeObserver", StubResizeObserver);
	const updatePosition = vi.fn();
	const actions = { current: { updatePosition } satisfies PopoverActions };
	const content = { current: document.createElement("div") };
	const hook = renderHook(
		(props: { open: boolean }) =>
			useRepositionOnContentResize(actions, content, props.open),
		{ initialProps: { open } },
	);
	return { hook, updatePosition, content };
}

afterEach(() => {
	vi.unstubAllGlobals();
	resize = undefined;
	observed = [];
	disconnected = 0;
});

describe("useRepositionOnContentResize", () => {
	it("repositions the popover when its content changes size", () => {
		const { updatePosition, content } = setup(true);

		expect(observed).toEqual([content.current]);
		resize?.();

		expect(updatePosition).toHaveBeenCalledTimes(1);
	});

	it("watches nothing while the popover is closed", () => {
		setup(false);

		expect(observed).toEqual([]);
	});

	it("stops watching once the popover closes", () => {
		const { hook } = setup(true);

		hook.rerender({ open: false });

		expect(disconnected).toBe(1);
	});
});
