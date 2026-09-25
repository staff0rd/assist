// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { hasTerminalSize } from "./hasTerminalSize";

function paneOfSize(width: number, height: number): HTMLElement {
	const el = document.createElement("div");
	Object.defineProperty(el, "clientWidth", { value: width });
	Object.defineProperty(el, "clientHeight", { value: height });
	return el;
}

describe("hasTerminalSize", () => {
	it("accepts a pane with a measured box", () => {
		expect(hasTerminalSize(paneOfSize(800, 600))).toBe(true);
	});

	it("rejects a pane collapsed by the diff panel's full mode", () => {
		expect(hasTerminalSize(paneOfSize(0, 0))).toBe(false);
	});

	it("rejects a pane with width but no height", () => {
		expect(hasTerminalSize(paneOfSize(800, 0))).toBe(false);
	});

	it("rejects a pane that is not mounted", () => {
		expect(hasTerminalSize(null)).toBe(false);
	});
});
