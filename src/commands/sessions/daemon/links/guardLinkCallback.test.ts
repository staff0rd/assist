import { describe, expect, it, vi } from "vitest";
import { daemonLog } from "../daemonLog";
import { guardLinkCallback } from "./guardLinkCallback";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

describe("guardLinkCallback", () => {
	it("logs a throw from the callback instead of propagating it", () => {
		const guarded = guardLinkCallback("link a ws: close handler", () => {
			throw new Error('Unrecognized key "next"');
		});
		expect(() => guarded()).not.toThrow();
		expect(daemonLog).toHaveBeenCalledWith(
			expect.stringContaining("link a ws: close handler threw; ignored"),
		);
	});

	it("passes arguments through", () => {
		const callback = vi.fn();
		guardLinkCallback("x", callback)("reason");
		expect(callback).toHaveBeenCalledWith("reason");
	});
});
