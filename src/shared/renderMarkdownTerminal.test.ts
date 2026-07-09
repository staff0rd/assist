import { afterEach, describe, expect, it } from "vitest";
import { renderMarkdownTerminal } from "./renderMarkdownTerminal";

const originalColumns = process.stdout.columns;
const ansiPattern = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");

function stripAnsi(text: string): string {
	return text.replace(ansiPattern, "");
}

describe("renderMarkdownTerminal", () => {
	afterEach(() => {
		process.stdout.columns = originalColumns;
	});

	it("wraps prose to the terminal width", () => {
		process.stdout.columns = 40;
		const long =
			"This is a fairly long paragraph that should be reflowed across several lines rather than printed as a single unbroken line.";
		const out = stripAnsi(renderMarkdownTerminal(long));
		const lines = out.split("\n");
		expect(lines.length).toBeGreaterThan(1);
		for (const line of lines) {
			expect(line.length).toBeLessThanOrEqual(40);
		}
	});

	it("renders headings and bullet lists as structured text", () => {
		const out = stripAnsi(renderMarkdownTerminal("# Title\n\n- one\n- two"));
		expect(out).toContain("Title");
		expect(out).toContain("one");
		expect(out).toContain("two");
		expect(out).toContain("*");
	});

	it("consumes inline markdown markers inside list items", () => {
		const out = stripAnsi(
			renderMarkdownTerminal("- a **bold** word and `code` span"),
		);
		expect(out).not.toContain("**");
		expect(out).not.toContain("`");
		expect(out).toContain("bold");
		expect(out).toContain("code");
	});
});
