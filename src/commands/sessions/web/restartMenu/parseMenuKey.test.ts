import { describe, expect, it } from "vitest";
import { parseMenuKey } from "./parseMenuKey";

const CTRL_R = String.fromCharCode(18);
const CTRL_C = String.fromCharCode(3);
const ESC = String.fromCharCode(27);

describe("parseMenuKey", () => {
	it("recognises the configured toggle key", () => {
		expect(parseMenuKey(CTRL_R, CTRL_R)).toEqual({ key: "toggle" });
	});

	it("recognises Ctrl+C as quit", () => {
		expect(parseMenuKey(CTRL_C, CTRL_R)).toEqual({ key: "quit" });
	});

	it("recognises Esc as dismiss", () => {
		expect(parseMenuKey(ESC, CTRL_R)).toEqual({ key: "dismiss" });
	});

	it("recognises Enter as select", () => {
		expect(parseMenuKey("\r", CTRL_R)).toEqual({ key: "select" });
		expect(parseMenuKey("\n", CTRL_R)).toEqual({ key: "select" });
	});

	it("recognises arrow keys", () => {
		expect(parseMenuKey(`${ESC}[A`, CTRL_R)).toEqual({ key: "up" });
		expect(parseMenuKey(`${ESC}[B`, CTRL_R)).toEqual({ key: "down" });
	});

	it("recognises number keys as digits", () => {
		expect(parseMenuKey("1", CTRL_R)).toEqual({ key: "digit", digit: 1 });
		expect(parseMenuKey("3", CTRL_R)).toEqual({ key: "digit", digit: 3 });
	});

	it("returns none for unknown input", () => {
		expect(parseMenuKey("x", CTRL_R)).toEqual({ key: "none" });
	});

	it("prefers the toggle key when it collides with another binding", () => {
		expect(parseMenuKey(ESC, ESC)).toEqual({ key: "toggle" });
	});
});
