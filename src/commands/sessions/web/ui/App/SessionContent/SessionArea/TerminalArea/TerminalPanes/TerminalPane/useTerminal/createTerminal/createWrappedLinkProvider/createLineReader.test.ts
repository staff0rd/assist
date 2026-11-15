import headless from "@xterm/headless";
import { describe, expect, it } from "vitest";
import { claudeLoginOutput } from "./claudeLoginOutput";
import { createLineReader } from "./createLineReader";
import { findTerminalLinks } from "./findTerminalLinks";

const loginUrl = /;(https:\/\/claude\.com\/[\w%&=+.:/?-]+)/.exec(
	claudeLoginOutput,
)?.[1];

async function render(cols: number, data: string) {
	const term = new headless.Terminal({
		cols,
		rows: 40,
		allowProposedApi: true,
	});
	const readLine = createLineReader(term);
	await new Promise<void>((resolve) => term.write(data, resolve));
	return { term, readLine };
}

function rowsContaining(
	readLine: ReturnType<typeof createLineReader>,
	parts: string[],
): number[] {
	const rows: number[] = [];
	for (let i = 0; readLine(i); i++)
		if (parts.some((part) => readLine(i)?.text.includes(part)))
			rows.push(i + 1);
	return rows;
}

function linkTextsOnUrlRows(readLine: ReturnType<typeof createLineReader>) {
	const rows = rowsContaining(readLine, [
		"https://claude.com",
		"VGXPDEJZvxMdLHOxU",
	]);
	const first = rows[0] ?? 0;
	const last = rows[rows.length - 1] ?? 0;
	const texts: (string | undefined)[] = [];
	for (let y = first; y <= last; y++)
		texts.push(findTerminalLinks(readLine, y)[0]?.text);
	return texts;
}

describe("Claude Code's /login url hard-wrapped at 80 cols", () => {
	it("captures a url that wraps across several rows", () => {
		expect(loginUrl?.length).toBeGreaterThan(400);
	});

	it.each([
		["the same width", 80, 80],
		["a terminal widened after it rendered", 80, 120],
		["a terminal wider than the pty", 100, 100],
		["a terminal narrower than the pty", 60, 60],
	])(
		"detects the full url on every row in %s",
		async (_label, cols, finalCols) => {
			const { term, readLine } = await render(cols, claudeLoginOutput);
			term.resize(finalCols, 40);

			const texts = linkTextsOnUrlRows(readLine);

			expect(texts.length).toBeGreaterThan(1);
			expect(new Set(texts)).toEqual(new Set([loginUrl]));
		},
	);
});

describe("createLineReader", () => {
	const url = `https://example.com/${"a".repeat(40)}`;

	it("joins a url cut at a width the terminal had before it was widened", async () => {
		const { term, readLine } = await render(
			40,
			`${url.slice(0, 40)}\r\n${url.slice(40)}\r\n`,
		);
		term.resize(100, 40);

		expect(findTerminalLinks(readLine, 2)[0]?.text).toBe(url);
	});

	it("keeps a url ending a line separate from the next line of text", async () => {
		const { readLine } = await render(
			100,
			"remote:   https://github.com/o/r/pull/new/a-branch-name\r\nremote:\r\n",
		);

		expect(findTerminalLinks(readLine, 1)[0]?.text).toBe(
			"https://github.com/o/r/pull/new/a-branch-name",
		);
	});
});
