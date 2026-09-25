// @vitest-environment jsdom
import type { PopoverActions } from "@mui/material";
import { act, renderHook } from "@testing-library/react";
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
	const element = document.createElement("div");
	const hook = renderHook(
		(props: { open: boolean }) =>
			useRepositionOnContentResize(actions, props.open),
		{ initialProps: { open } },
	);
	return { hook, updatePosition, element };
}

afterEach(() => {
	vi.unstubAllGlobals();
	resize = undefined;
	observed = [];
	disconnected = 0;
});

describe("useRepositionOnContentResize", () => {
	it("repositions the popover when its content changes size", () => {
		const { hook, updatePosition, element } = setup(true);

		act(() => hook.result.current(element));

		expect(observed).toEqual([element]);
		resize?.();

		expect(updatePosition).toHaveBeenCalledTimes(1);
	});

	it("watches the content box even when it attaches after the first render", () => {
		const { hook, element } = setup(true);

		hook.rerender({ open: true });
		act(() => hook.result.current(element));

		expect(observed).toEqual([element]);
	});

	it("watches nothing while the popover is closed", () => {
		const { hook, element } = setup(false);

		act(() => hook.result.current(element));

		expect(observed).toEqual([]);
	});

	it("stops watching once the popover closes", () => {
		const { hook, element } = setup(true);
		act(() => hook.result.current(element));

		hook.rerender({ open: false });

		expect(disconnected).toBe(1);
	});
});
