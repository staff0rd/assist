import type { ChangeData } from "react-diff-view";
import type { DiffRangeEnd } from "./diffRangeEndpoints";

export function quoteOf(
	range: Range,
	start: DiffRangeEnd,
	end: DiffRangeEnd,
	quoted: ChangeData[],
): string {
	const withinOneCodeCell =
		start.cell === end.cell && start.cell.classList.contains("diff-code");
	return withinOneCodeCell
		? range.toString().trim()
		: quoted.map((change) => change.content).join("\n");
}
