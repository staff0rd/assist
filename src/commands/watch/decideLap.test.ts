import { describe, expect, it } from "vitest";
import { decideLap } from "./decideLap";

describe("decideLap", () => {
	it.each([0, 2, 4])("relaunches after exit %i", (code) => {
		expect(decideLap({ code, signal: null }, false)).toEqual({
			kind: "relaunch",
		});
	});

	it.each([1, 3, 130])("exits with the child's code %i", (code) => {
		expect(decideLap({ code, signal: null }, false)).toEqual({
			kind: "exit",
			code,
		});
	});

	it("relaunches when the child was killed by a signal", () => {
		expect(decideLap({ code: null, signal: "SIGKILL" }, false)).toEqual({
			kind: "relaunch",
		});
	});

	it("exits with an unrecognised code rather than looping on it", () => {
		expect(decideLap({ code: 5, signal: null }, false)).toEqual({
			kind: "exit",
			code: 5,
		});
	});

	it("exits 130 when the loop itself was interrupted, whatever the child did", () => {
		expect(decideLap({ code: null, signal: "SIGINT" }, true)).toEqual({
			kind: "exit",
			code: 130,
		});
		expect(decideLap({ code: 0, signal: null }, true)).toEqual({
			kind: "exit",
			code: 130,
		});
	});
});
