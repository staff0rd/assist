// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountHost } from "./mountHost";

function anchorAt(left: number): HTMLElement {
	const anchor = document.createElement("button");
	anchor.getBoundingClientRect = () =>
		({ left, bottom: 40, top: 20, right: left + 20 }) as DOMRect;
	document.body.append(anchor);
	return anchor;
}

describe("mountHost", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"ResizeObserver",
			class {
				observe() {}
				disconnect() {}
			},
		);
		Object.defineProperty(globalThis, "innerWidth", {
			configurable: true,
			value: 1000,
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		document.body.innerHTML = "";
	});

	it("sizes the host to its content, capped at the viewport minus the gutters", () => {
		const host = document.createElement("div");
		mountHost(host, anchorAt(100));

		expect(host.style.width).toBe("max-content");
		expect(host.style.minWidth).toBe("320px");
		expect(host.style.maxWidth).toBe("968px");
	});

	it("clamps the left edge so the measured width stays inside the viewport", () => {
		const host = document.createElement("div");
		Object.defineProperty(host, "offsetWidth", { value: 500 });
		mountHost(host, anchorAt(900));

		expect(host.style.left).toBe("484px");
	});
});
