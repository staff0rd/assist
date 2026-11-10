import { describe, expect, it } from "vitest";
import { createScreenMirror } from "./createScreenMirror";

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("createScreenMirror", () => {
	it("includes output not yet parsed in the snapshot", () => {
		const screen = createScreenMirror(80, 5);

		screen.write("hello");

		expect(screen.snapshot()).toContain("hello");
	});

	it("reflows a wrapped line to the current width", async () => {
		const screen = createScreenMirror(20, 5);
		const line = "word ".repeat(8).trim();
		screen.write(`${line}\r\n> `);
		await settle();

		screen.resize(60, 5);

		expect(screen.snapshot()).toBe(`${line}\r\n> `);
	});

	it("keeps hard line breaks", async () => {
		const screen = createScreenMirror(40, 5);
		screen.write("one\r\ntwo");
		await settle();

		expect(screen.snapshot()).toBe("one\r\ntwo");
	});

	it("restores SGR mouse encoding alongside mouse tracking", async () => {
		const screen = createScreenMirror(40, 5);
		screen.write("\x1b[?1002h\x1b[?1006h");
		await settle();

		expect(screen.snapshot()).toContain("\x1b[?1002h\x1b[?1006h");
	});

	it("drops SGR mouse encoding once the app resets it", async () => {
		const screen = createScreenMirror(40, 5);
		screen.write("\x1b[?1006h\x1b[?1006l");
		await settle();

		expect(screen.snapshot()).not.toContain("1006");
	});
});
