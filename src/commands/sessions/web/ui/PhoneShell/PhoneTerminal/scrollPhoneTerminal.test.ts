import type { Terminal } from "@xterm/xterm";
import { describe, expect, it } from "vitest";
import { scrollPhoneTerminal } from "./scrollPhoneTerminal";

const CELL = 15;

function setup(scrollTop: number, viewportY: number, baseY = 100) {
	const el = {
		scrollTop,
		querySelector: () => ({ clientHeight: CELL * 30 }),
	} as unknown as HTMLElement;
	const term = {
		rows: 30,
		buffer: { active: { viewportY, baseY } },
		scrollLines(n: number) {
			this.buffer.active.viewportY += n;
		},
	};
	return {
		el,
		term,
		run: (dy: number) =>
			scrollPhoneTerminal(el, term as unknown as Terminal, dy, { px: 0 }),
	};
}

describe("scrollPhoneTerminal", () => {
	it("scrolls the container before the scrollback when scrolling up", () => {
		const { el, term, run } = setup(20, 100);
		run(-10);
		expect(el.scrollTop).toBe(10);
		expect(term.buffer.active.viewportY).toBe(100);
	});

	it("scrolls into the scrollback once the container is at the top", () => {
		const { el, term, run } = setup(10, 100);
		run(-10 - CELL * 3);
		expect(el.scrollTop).toBe(0);
		expect(term.buffer.active.viewportY).toBe(97);
	});

	it("returns through the scrollback before scrolling the container down", () => {
		const { el, term, run } = setup(0, 90);
		run(CELL * 4);
		expect(term.buffer.active.viewportY).toBe(94);
		expect(el.scrollTop).toBe(0);
	});

	it("scrolls the container down once the scrollback is at the bottom", () => {
		const { el, run } = setup(0, 100);
		run(30);
		expect(el.scrollTop).toBe(30);
	});

	it("stops at the start of the scrollback", () => {
		const { term, run } = setup(0, 0);
		run(-CELL * 5);
		expect(term.buffer.active.viewportY).toBe(0);
	});
});
