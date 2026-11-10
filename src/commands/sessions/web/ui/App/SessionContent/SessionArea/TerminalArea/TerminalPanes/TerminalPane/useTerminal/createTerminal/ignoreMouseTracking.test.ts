import type { IParser } from "@xterm/xterm";
import { describe, expect, it, vi } from "vitest";
import { ignoreMouseTracking } from "./ignoreMouseTracking";

type Handler = (params: (number | number[])[]) => boolean;
type WheelHandler = (event: WheelEvent) => boolean;

function register() {
	const handlers: Record<string, Handler> = {};
	let wheel: WheelHandler = () => true;
	const registerCsiHandler = vi.fn((id: { final: string }, h: Handler) => {
		handlers[id.final] = h;
		return { dispose: vi.fn() };
	});
	let ris = () => false;
	const registerEscHandler = vi.fn((_id, h: () => boolean) => {
		ris = h;
		return { dispose: vi.fn() };
	});
	const input = vi.fn();
	ignoreMouseTracking({
		parser: { registerCsiHandler, registerEscHandler } as unknown as IParser,
		attachCustomWheelEventHandler: (h: WheelHandler) => {
			wheel = h;
		},
		input,
		cols: 80,
		rows: 24,
		element: undefined,
	});
	return {
		registerCsiHandler,
		input,
		set: (p: (number | number[])[]) => handlers.h(p),
		reset: (p: (number | number[])[]) => handlers.l(p),
		ris: () => ris(),
		wheel: (deltaY: number, deltaMode = 1) =>
			wheel({ deltaY, deltaMode, clientX: 0, clientY: 0 } as WheelEvent),
	};
}

describe("ignoreMouseTracking", () => {
	it("hooks DECSET and DECRST", () => {
		const { registerCsiHandler } = register();
		expect(registerCsiHandler).toHaveBeenCalledWith(
			{ prefix: "?", final: "h" },
			expect.any(Function),
		);
		expect(registerCsiHandler).toHaveBeenCalledWith(
			{ prefix: "?", final: "l" },
			expect.any(Function),
		);
	});

	it("swallows mouse tracking modes", () => {
		const { set } = register();
		for (const mode of [9, 1000, 1001, 1002, 1003]) {
			expect(set([mode])).toBe(true);
		}
		expect(set([1000, 1002])).toBe(true);
	});

	it("lets other private modes through", () => {
		const { set, reset } = register();
		expect(set([1006])).toBe(false);
		expect(set([1049])).toBe(false);
		expect(set([25])).toBe(false);
		expect(set([1000, 1049])).toBe(false);
		expect(reset([1000])).toBe(false);
	});

	it("leaves the wheel to xterm when the app has no mouse tracking", () => {
		const { wheel, input } = register();
		expect(wheel(-1)).toBe(true);
		expect(input).not.toHaveBeenCalled();
	});

	it("forwards the wheel to an app tracking the mouse", () => {
		const { set, wheel, input } = register();
		set([1002]);
		set([1006]);
		expect(wheel(-3)).toBe(false);
		expect(wheel(2)).toBe(false);
		expect(input.mock.calls).toEqual([
			["\x1b[<64;1;1M", false],
			["\x1b[<65;1;1M", false],
		]);
	});

	it("uses X10 encoding without SGR mode", () => {
		const { set, wheel, input } = register();
		set([1000]);
		wheel(-1);
		expect(input).toHaveBeenCalledWith("\x1b[M`!!", false);
	});

	it("accumulates pixel deltas into whole rows", () => {
		const { set, wheel, input } = register();
		set([1000]);
		wheel(10, 0);
		expect(input).not.toHaveBeenCalled();
		wheel(10, 0);
		expect(input).toHaveBeenCalledTimes(1);
	});

	it("stops forwarding once tracking is reset", () => {
		const { set, reset, wheel, input } = register();
		set([1000]);
		reset([1000]);
		expect(wheel(-1)).toBe(true);
		expect(input).not.toHaveBeenCalled();
	});

	it("stops forwarding after a full terminal reset", () => {
		const { set, ris, wheel, input } = register();
		set([1000]);
		expect(ris()).toBe(false);
		expect(wheel(-1)).toBe(true);
		expect(input).not.toHaveBeenCalled();
	});
});
