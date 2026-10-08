import { describe, expect, it } from "vitest";
import { isTerminalResponse } from "./isTerminalResponse";

describe("isTerminalResponse", () => {
	it.each([
		["primary device attributes", "\x1b[?1;2c"],
		["secondary device attributes", "\x1b[>0;276;0c"],
		["cursor position report", "\x1b[24;80R"],
		["status report", "\x1b[0n"],
		["mode report", "\x1b[?2004;2$y"],
		["window size report", "\x1b[8;50;187t"],
		["keyboard protocol report", "\x1b[?0u"],
		["focus in", "\x1b[I"],
		["OSC colour reply (BEL)", "\x1b]10;rgb:ffff/ffff/ffff\x07"],
		["OSC colour reply (ST)", "\x1b]11;rgb:0000/0000/0000\x1b\\"],
		["DCS version reply", "\x1bP>|xterm.js(5.5.0)\x1b\\"],
		["several replies at once", "\x1b[?1;2c\x1b[1;1R"],
	])("treats a %s as a response", (_, data) => {
		expect(isTerminalResponse(data)).toBe(true);
	});

	it.each([
		["typed text", "hello"],
		["enter", "\r"],
		["arrow key", "\x1b[A"],
		["escape", "\x1b"],
		["bracketed paste", "\x1b[200~text\x1b[201~"],
		["SGR mouse click", "\x1b[<0;10;5M"],
		["response followed by typing", "\x1b[0nx"],
	])("treats %s as user input", (_, data) => {
		expect(isTerminalResponse(data)).toBe(false);
	});
});
