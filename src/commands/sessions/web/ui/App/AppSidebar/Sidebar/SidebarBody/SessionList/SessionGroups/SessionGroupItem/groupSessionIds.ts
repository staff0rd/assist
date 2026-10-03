import type { NestedSessionRow } from "../../../../../nestUnderBacklogRun";

export function groupSessionIds(rows: NestedSessionRow[]): string[] {
	return rows.flatMap((row) => [
		row.session.id,
		...row.children.map((child) => child.id),
	]);
}
