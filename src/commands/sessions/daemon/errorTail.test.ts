import { describe, expect, it } from "vitest";
import { errorTail, stripAnsi } from "./errorTail";

const ESC = String.fromCharCode(27);

describe("stripAnsi", () => {
	it("removes colour and cursor escape sequences", () => {
		const input = `${ESC}[31mError:${ESC}[0m failed${ESC}[K`;
		expect(stripAnsi(input)).toBe("Error: failed");
	});
});

describe("errorTail", () => {
	it("returns an empty string for empty or whitespace-only output", () => {
		expect(errorTail("")).toBe("");
		expect(errorTail("   \n\t\n")).toBe("");
	});

	it("strips ANSI and normalises carriage returns", () => {
		const input = `${ESC}[31mboom${ESC}[0m\r\ndetail`;
		expect(errorTail(input)).toBe("boom\ndetail");
	});

	it("keeps only the last lines when output is long", () => {
		const lines = Array.from({ length: 100 }, (_, i) => `line ${i}`).join("\n");
		const tail = errorTail(lines);
		expect(tail.split("\n").length).toBe(40);
		expect(tail.split("\n")[0]).toBe("line 60");
		expect(tail.split("\n").at(-1)).toBe("line 99");
	});
});
