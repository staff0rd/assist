import type { ChangeData } from "react-diff-view";

export type DiffSide = "old" | "new";

function columnSide(cell: HTMLElement): DiffSide | null {
	const row = cell.closest("tr");
	if (!row || row.cells.length < 2) return null;
	return (cell as HTMLTableCellElement).cellIndex < row.cells.length / 2
		? "old"
		: "new";
}

function sideOf(cell: HTMLElement, change: ChangeData): DiffSide | null {
	if (!cell.closest("table")?.classList.contains("diff-split")) return null;
	if (change.type === "delete") return "old";
	if (change.type === "insert") return "new";
	return columnSide(cell);
}

export function resolveDiffSide(
	start: { cell: HTMLElement; change: ChangeData },
	end: { cell: HTMLElement; change: ChangeData },
): DiffSide | null {
	return sideOf(start.cell, start.change) ?? sideOf(end.cell, end.change);
}
