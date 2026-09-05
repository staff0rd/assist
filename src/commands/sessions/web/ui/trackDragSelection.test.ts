// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Caret } from "./caretFromPoint";
import { linkDragGuard } from "./linkDragGuard";
import { trackDragSelection } from "./trackDragSelection";

function scene() {
	const wrapper = document.createElement("div");
	const content = document.createElement("div");
	content.innerHTML = '<p>see <a href="#target">docs</a> for more</p>';
	wrapper.append(content);
	document.body.append(wrapper);
	const link = content.querySelector("a") as HTMLAnchorElement;
	const anchor: Caret = { node: link.firstChild as Node, offset: 0 };
	return { wrapper, content, link, anchor };
}

function handlers() {
	return { onStart: vi.fn(), onMove: vi.fn(), onEnd: vi.fn() };
}

function mouse(type: string, x: number, y: number) {
	globalThis.dispatchEvent(
		new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }),
	);
}

function click(el: Element): MouseEvent {
	const event = new MouseEvent("click", { bubbles: true, cancelable: true });
	el.dispatchEvent(event);
	return event;
}

afterEach(() => {
	document.body.innerHTML = "";
});

describe("trackDragSelection", () => {
	it("produces no selection and lets the link navigate on a plain click", () => {
		const { wrapper, content, link, anchor } = scene();
		const h = handlers();
		trackDragSelection({
			anchor,
			origin: { x: 10, y: 10 },
			els: { wrapper, content },
			guard: linkDragGuard(link),
			handlers: h,
		});

		mouse("mouseup", 11, 10);

		expect(h.onStart).not.toHaveBeenCalled();
		expect(h.onEnd).not.toHaveBeenCalled();
		expect(click(link).defaultPrevented).toBe(false);
	});

	it("selects and suppresses navigation once a press on a link passes the drag threshold", () => {
		const { wrapper, content, link, anchor } = scene();
		const h = handlers();
		trackDragSelection({
			anchor,
			origin: { x: 10, y: 10 },
			els: { wrapper, content },
			guard: linkDragGuard(link),
			handlers: h,
		});

		mouse("mousemove", 12, 10);
		expect(h.onStart).not.toHaveBeenCalled();

		mouse("mousemove", 40, 10);
		mouse("mouseup", 40, 10);

		expect(h.onStart).toHaveBeenCalledTimes(1);
		expect(h.onEnd).toHaveBeenCalledTimes(1);
		expect(click(link).defaultPrevented).toBe(true);
	});

	it("keeps click-a-word-to-comment for a press off a link", () => {
		const { wrapper, content, anchor } = scene();
		const h = handlers();
		trackDragSelection({
			anchor,
			origin: { x: 10, y: 10 },
			els: { wrapper, content },
			guard: null,
			handlers: h,
		});

		expect(h.onStart).toHaveBeenCalledTimes(1);

		mouse("mouseup", 10, 10);

		expect(h.onEnd).toHaveBeenCalledTimes(1);
		expect(h.onEnd).toHaveBeenCalledWith(anchor, anchor, { wrapper, content });
	});

	it("stops listening after the press ends", () => {
		const { wrapper, content, anchor } = scene();
		const h = handlers();
		trackDragSelection({
			anchor,
			origin: { x: 10, y: 10 },
			els: { wrapper, content },
			guard: null,
			handlers: h,
		});

		mouse("mouseup", 10, 10);
		mouse("mouseup", 10, 10);

		expect(h.onEnd).toHaveBeenCalledTimes(1);
	});
});
