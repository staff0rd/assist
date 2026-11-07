import type { IParser } from "@xterm/xterm";
import { describe, expect, it, vi } from "vitest";
import { ignoreMouseTracking } from "./ignoreMouseTracking";

type Handler = (params: (number | number[])[]) => boolean;

function register() {
	let handler: Handler = () => false;
	const registerCsiHandler = vi.fn((_id, h: Handler) => {
		handler = h;
		return { dispose: vi.fn() };
	});
	ignoreMouseTracking({ parser: { registerCsiHandler } as unknown as IParser });
	return {
		registerCsiHandler,
		handle: (p: (number | number[])[]) => handler(p),
	};
}

describe("ignoreMouseTracking", () => {
	it("hooks DECSET", () => {
		const { registerCsiHandler } = register();
		expect(registerCsiHandler).toHaveBeenCalledWith(
			{ prefix: "?", final: "h" },
			expect.any(Function),
		);
	});

	it("swallows mouse tracking modes", () => {
		const { handle } = register();
		for (const mode of [9, 1000, 1001, 1002, 1003]) {
			expect(handle([mode])).toBe(true);
		}
		expect(handle([1000, 1002])).toBe(true);
	});

	it("lets other private modes through", () => {
		const { handle } = register();
		expect(handle([1006])).toBe(false);
		expect(handle([1049])).toBe(false);
		expect(handle([25])).toBe(false);
		expect(handle([1000, 1049])).toBe(false);
	});
});
