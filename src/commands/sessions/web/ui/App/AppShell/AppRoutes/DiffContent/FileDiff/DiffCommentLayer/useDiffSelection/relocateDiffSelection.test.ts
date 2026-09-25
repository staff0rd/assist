// @vitest-environment jsdom
import type { ChangeData, HunkData } from "react-diff-view";
import { describe, expect, it } from "vitest";
import { buildChangeIndex } from "../buildChangeIndex";
import type { DiffSelection } from "../finishDiffSelection";
import { relocateDiffSelection } from "./relocateDiffSelection";

function hunkOf(changes: ChangeData[]): HunkData {
	return {
		content: "@@ -10,2 +10,2 @@",
		oldStart: 10,
		newStart: 10,
		oldLines: changes.length,
		newLines: changes.length,
		changes,
	};
}

const original: ChangeData[] = [
	{ type: "insert", isInsert: true, lineNumber: 10, content: "const a = 1;" },
	{ type: "insert", isInsert: true, lineNumber: 11, content: "const b = 2;" },
];

const selection: DiffSelection = {
	quote: "const a = 1;\nconst b = 2;",
	top: 220,
	left: 48,
	startLine: 10,
	endLine: 11,
	moved: false,
	changes: [
		{ key: "I10", content: "const a = 1;" },
		{ key: "I11", content: "const b = 2;" },
	],
	origin: { key: "I10", top: 40, left: 40 },
	rects: [
		{ top: 40, left: 60, width: 96, height: 16 },
		{ top: 56, left: 40, width: 88, height: 16 },
	],
};

function boundsOf(top: number, left: number): DOMRect {
	return {
		top,
		left,
		width: 400,
		height: 16,
		right: left + 400,
		bottom: top + 16,
		x: left,
		y: top,
		toJSON: () => ({}),
	} as DOMRect;
}

function wrapperWith(keys: string[], firstCellTop = 140): HTMLElement {
	const wrapper = document.createElement("div");
	wrapper.innerHTML = `<table><tbody>${keys
		.map(
			(key) =>
				`<tr><td class="diff-code" data-change-key="${key}">code</td></tr>`,
		)
		.join("")}</tbody></table>`;
	wrapper.getBoundingClientRect = () => boundsOf(100, 8);
	for (const [i, cell] of Array.from(
		wrapper.querySelectorAll<HTMLElement>("td.diff-code"),
	).entries())
		cell.getBoundingClientRect = () => boundsOf(firstCellTop + i * 16, 48);
	return wrapper;
}

describe("relocateDiffSelection", () => {
	it("keeps the same selection object when the anchor cell has not shifted", () => {
		const index = buildChangeIndex([hunkOf(original)]);

		expect(
			relocateDiffSelection(selection, index, wrapperWith(["I10", "I11"])),
		).toBe(selection);
	});

	it("shifts the highlight and the popover by the anchor cell's movement", () => {
		const index = buildChangeIndex([hunkOf(original)]);

		const next = relocateDiffSelection(
			selection,
			index,
			wrapperWith(["I10", "I11"], 172),
		);

		expect(next.moved).toBe(false);
		expect(next.quote).toBe(selection.quote);
		expect(next.rects).toEqual([
			{ top: 72, left: 60, width: 96, height: 16 },
			{ top: 88, left: 40, width: 88, height: 16 },
		]);
		expect(next.top).toBe(252);
		expect(next.origin).toEqual({ key: "I10", top: 72, left: 40 });
	});

	it("settles after one shift so the layout effect does not loop", () => {
		const index = buildChangeIndex([hunkOf(original)]);
		const wrapper = wrapperWith(["I10", "I11"], 172);
		const relocated = relocateDiffSelection(selection, index, wrapper);

		expect(relocateDiffSelection(relocated, index, wrapper)).toBe(relocated);
	});

	it("marks the selection as moved when a selected line's content changed", () => {
		const index = buildChangeIndex([
			hunkOf([
				original[0],
				{
					type: "insert",
					isInsert: true,
					lineNumber: 11,
					content: "const b = 3;",
				},
			]),
		]);

		const next = relocateDiffSelection(
			selection,
			index,
			wrapperWith(["I10", "I11"]),
		);

		expect(next.moved).toBe(true);
		expect(next.rects).toEqual([]);
		expect(next.quote).toBe(selection.quote);
		expect(next.startLine).toBe(10);
	});

	it("marks the selection as moved when a selected line is gone", () => {
		const index = buildChangeIndex([hunkOf([original[0]])]);

		expect(
			relocateDiffSelection(selection, index, wrapperWith(["I10"])).moved,
		).toBe(true);
	});

	it("stays moved once the selected lines have changed", () => {
		const index = buildChangeIndex([hunkOf([original[0]])]);
		const moved = relocateDiffSelection(selection, index, wrapperWith(["I10"]));

		expect(
			relocateDiffSelection(
				moved,
				buildChangeIndex([hunkOf(original)]),
				wrapperWith(["I10", "I11"], 172),
			),
		).toBe(moved);
	});

	it("keeps the existing highlight when the cells are not rendered yet", () => {
		const index = buildChangeIndex([hunkOf(original)]);

		expect(relocateDiffSelection(selection, index, wrapperWith([]))).toBe(
			selection,
		);
	});
});
