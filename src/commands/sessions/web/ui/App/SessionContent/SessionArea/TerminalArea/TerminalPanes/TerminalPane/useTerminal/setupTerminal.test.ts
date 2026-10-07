// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TerminalHandle } from "./createTerminal";
import { setupTerminal } from "./setupTerminal";

const fit = vi.fn();

vi.mock("./createTerminal", () => ({
	createTerminal: () =>
		({
			term: {
				cols: 120,
				rows: 40,
				onData: vi.fn(),
				attachCustomKeyEventHandler: vi.fn(),
				write: vi.fn(),
			},
			fitAddon: { fit },
			dispose: vi.fn(),
		}) as unknown as TerminalHandle,
}));

let notifyResize: () => void = () => {};

class StubResizeObserver {
	constructor(callback: () => void) {
		notifyResize = callback;
	}
	observe() {}
	disconnect() {}
}

function paneOfSize(width: number, height: number): HTMLElement {
	const el = document.createElement("div");
	Object.defineProperty(el, "clientWidth", { value: width });
	Object.defineProperty(el, "clientHeight", { value: height });
	return el;
}

function attach(el: HTMLElement, mayResize = true) {
	const sendResize = vi.fn();
	setupTerminal(el, "session-1", {
		sendInput: vi.fn(),
		onOutput: () => () => {},
		sendResize,
		isStale: () => !mayResize,
		mayResize: () => mayResize,
	});
	return sendResize;
}

beforeEach(() => {
	fit.mockClear();
	vi.stubGlobal("ResizeObserver", StubResizeObserver);
});

describe("setupTerminal resize reporting", () => {
	it("fits and reports the terminal size when the split changes", () => {
		const sendResize = attach(paneOfSize(600, 400));

		notifyResize();

		expect(fit).toHaveBeenCalled();
		expect(sendResize).toHaveBeenCalledWith("session-1", 120, 40);
	});

	it("stays silent while the pane is collapsed by full mode", () => {
		const sendResize = attach(paneOfSize(0, 0));

		notifyResize();

		expect(fit).not.toHaveBeenCalled();
		expect(sendResize).not.toHaveBeenCalled();
	});

	it("stays silent while it may not size the session", () => {
		const sendResize = attach(paneOfSize(600, 400), false);

		notifyResize();

		expect(sendResize).not.toHaveBeenCalled();
	});
});

describe("setupTerminal output replay", () => {
	it("rewrites the buffered output that was dropped while stale", () => {
		let stale = true;
		const { handle } = setupTerminal(paneOfSize(600, 400), "session-1", {
			sendInput: vi.fn(),
			onOutput: (_id, handler) => {
				handler("crash reason");
				return () => {};
			},
			sendResize: vi.fn(),
			isStale: () => stale,
			mayResize: () => true,
		});
		expect(handle.term.write).not.toHaveBeenCalled();

		stale = false;
		handle.replayOutput();

		expect(handle.term.write).toHaveBeenCalledWith("crash reason");
	});
});
