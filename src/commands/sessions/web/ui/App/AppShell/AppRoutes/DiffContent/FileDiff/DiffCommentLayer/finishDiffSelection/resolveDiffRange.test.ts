// @vitest-environment jsdom
import type { ChangeData, HunkData } from "react-diff-view";
import { describe, expect, it } from "vitest";
import { buildChangeIndex } from "../buildChangeIndex";
import { resolveDiffRange } from "./resolveDiffRange";

const changes: ChangeData[] = [
	{
		type: "normal",
		isNormal: true,
		oldLineNumber: 10,
		newLineNumber: 10,
		content: "const a = 1;",
	},
	{ type: "delete", isDelete: true, lineNumber: 11, content: "const b = 2;" },
	{ type: "delete", isDelete: true, lineNumber: 12, content: "const c = 3;" },
	{ type: "insert", isInsert: true, lineNumber: 11, content: "const b = 3;" },
	{ type: "insert", isInsert: true, lineNumber: 12, content: "const c = 4;" },
	{ type: "insert", isInsert: true, lineNumber: 13, content: "const e = 6;" },
	{
		type: "normal",
		isNormal: true,
		oldLineNumber: 13,
		newLineNumber: 14,
		content: "const d = 5;",
	},
];

const hunk: HunkData = {
	content: "@@ -10,4 +10,5 @@",
	oldStart: 10,
	newStart: 10,
	oldLines: 4,
	newLines: 5,
	changes,
};

const index = buildChangeIndex([hunk]);

function gutter(key: string | null, type: string): string {
	return key === null
		? `<td class="diff-gutter diff-gutter-omit"></td>`
		: `<td class="diff-gutter diff-gutter-${type}" data-change-key="${key}"></td>`;
}

function code(key: string | null, type: string, content: string): string {
	return key === null
		? `<td class="diff-code diff-code-omit"></td>`
		: `<td class="diff-code diff-code-${type}" data-change-key="${key}">${content}</td>`;
}

function table(viewType: "unified" | "split", rows: string): HTMLElement {
	const host = document.createElement("div");
	host.innerHTML = `<table class="diff diff-${viewType}"><tbody>${rows}</tbody></table>`;
	document.body.replaceChildren(host);
	return host;
}

function unifiedTable(): HTMLElement {
	const row = (key: string, type: string, content: string) =>
		`<tr class="diff-line">${gutter(key, type)}${gutter(key, type)}${code(key, type, content)}</tr>`;
	return table(
		"unified",
		[
			row("N10", "normal", "const a = 1;"),
			row("D11", "delete", "const b = 2;"),
			row("D12", "delete", "const c = 3;"),
			row("I11", "insert", "const b = 3;"),
			row("I12", "insert", "const c = 4;"),
			row("I13", "insert", "const e = 6;"),
			row("N13", "normal", "const d = 5;"),
		].join(""),
	);
}

function splitTable(): HTMLElement {
	const row = (
		old: [string, string, string] | null,
		next: [string, string, string] | null,
	) =>
		`<tr class="diff-line">${gutter(old?.[0] ?? null, old?.[1] ?? "")}${code(old?.[0] ?? null, old?.[1] ?? "", old?.[2] ?? "")}${gutter(next?.[0] ?? null, next?.[1] ?? "")}${code(next?.[0] ?? null, next?.[1] ?? "", next?.[2] ?? "")}</tr>`;
	const normal10: [string, string, string] = ["N10", "normal", "const a = 1;"];
	const normal13: [string, string, string] = ["N13", "normal", "const d = 5;"];
	return table(
		"split",
		[
			row(normal10, normal10),
			row(["D11", "delete", "const b = 2;"], ["I11", "insert", "const b = 3;"]),
			row(["D12", "delete", "const c = 3;"], ["I12", "insert", "const c = 4;"]),
			row(null, ["I13", "insert", "const e = 6;"]),
			row(normal13, normal13),
		].join(""),
	);
}

function codeCells(host: HTMLElement, key: string): HTMLElement[] {
	return Array.from(
		host.querySelectorAll<HTMLElement>(
			`td.diff-code[data-change-key="${key}"]`,
		),
	);
}

function textOf(cell: HTMLElement): Text {
	return cell.firstChild as Text;
}

function rangeBetween(
	start: HTMLElement,
	startOffset: number,
	end: HTMLElement,
	endOffset: number,
): Range {
	const range = document.createRange();
	range.setStart(textOf(start), startOffset);
	range.setEnd(textOf(end), endOffset);
	return range;
}

function wholeCells(start: HTMLElement, end: HTMLElement): Range {
	return rangeBetween(start, 0, end, textOf(end).length);
}

describe("resolveDiffRange", () => {
	it("quotes just the selected substring of a single line", () => {
		const host = unifiedTable();
		const [cell] = codeCells(host, "N13");

		expect(resolveDiffRange(rangeBetween(cell, 6, cell, 11), index)).toEqual({
			startLine: 14,
			endLine: 14,
			quote: "d = 5",
			changes: [{ key: "N13", content: "const d = 5;" }],
		});
	});

	it("reports the new-file number for a context line", () => {
		const host = unifiedTable();
		const [cell] = codeCells(host, "N13");

		expect(resolveDiffRange(wholeCells(cell, cell), index)?.startLine).toBe(14);
	});

	it("quotes whole spanned lines for a multi-line selection", () => {
		const host = unifiedTable();
		const [start] = codeCells(host, "N10");
		const [end] = codeCells(host, "I12");

		expect(resolveDiffRange(wholeCells(start, end), index)).toEqual({
			startLine: 10,
			endLine: 12,
			quote: [
				"const a = 1;",
				"const b = 2;",
				"const c = 3;",
				"const b = 3;",
				"const c = 4;",
			].join("\n"),
			changes: [
				{ key: "N10", content: "const a = 1;" },
				{ key: "D11", content: "const b = 2;" },
				{ key: "D12", content: "const c = 3;" },
				{ key: "I11", content: "const b = 3;" },
				{ key: "I12", content: "const c = 4;" },
			],
		});
	});

	it("reports old-file numbers for a delete-only selection", () => {
		const host = unifiedTable();
		const [start] = codeCells(host, "D11");
		const [end] = codeCells(host, "D12");

		expect(resolveDiffRange(wholeCells(start, end), index)).toEqual({
			startLine: 11,
			endLine: 12,
			quote: "const b = 2;\nconst c = 3;",
			changes: [
				{ key: "D11", content: "const b = 2;" },
				{ key: "D12", content: "const c = 3;" },
			],
		});
	});

	it("quotes only the new column when dragging down the right side of a split view", () => {
		const host = splitTable();
		const start = codeCells(host, "N10")[1];
		const [end] = codeCells(host, "I13");

		expect(resolveDiffRange(wholeCells(start, end), index)).toEqual({
			startLine: 10,
			endLine: 13,
			quote: [
				"const a = 1;",
				"const b = 3;",
				"const c = 4;",
				"const e = 6;",
			].join("\n"),
			changes: [
				{ key: "N10", content: "const a = 1;" },
				{ key: "I11", content: "const b = 3;" },
				{ key: "I12", content: "const c = 4;" },
				{ key: "I13", content: "const e = 6;" },
			],
		});
	});

	it("quotes only the old column when dragging down the left side of a split view", () => {
		const host = splitTable();
		const [start] = codeCells(host, "N10");
		const end = codeCells(host, "N13")[0];

		expect(resolveDiffRange(wholeCells(start, end), index)).toEqual({
			startLine: 10,
			endLine: 14,
			quote: [
				"const a = 1;",
				"const b = 2;",
				"const c = 3;",
				"const d = 5;",
			].join("\n"),
			changes: [
				{ key: "N10", content: "const a = 1;" },
				{ key: "D11", content: "const b = 2;" },
				{ key: "D12", content: "const c = 3;" },
				{ key: "N13", content: "const d = 5;" },
			],
		});
	});

	it("returns null when the selection is outside any change", () => {
		const host = table("unified", "");
		const outside = document.createElement("p");
		outside.textContent = "not a diff";
		host.append(outside);
		const range = document.createRange();
		range.setStart(outside.firstChild as Text, 0);
		range.setEnd(outside.firstChild as Text, 4);

		expect(resolveDiffRange(range, index)).toBeNull();
	});
});
