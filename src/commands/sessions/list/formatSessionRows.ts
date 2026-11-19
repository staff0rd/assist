import type { SessionRow } from "./SessionRow";

const HEADERS = [
	"ID",
	"KIND",
	"STATUS",
	"NODE",
	"REPO/BRANCH",
	"AGENT",
	"TITLE",
];

function cells(row: SessionRow): string[] {
	const repo = [row.repo, row.branch].filter(Boolean).join("/");
	return [
		row.id,
		row.kind,
		row.status,
		row.node,
		repo || "-",
		row.agentName ?? "-",
		row.title,
	];
}

export function formatSessionRows(rows: SessionRow[]): string[] {
	const table = [HEADERS, ...rows.map(cells)];
	const widths = HEADERS.map((_, i) =>
		Math.max(...table.map((r) => r[i]!.length)),
	);
	return table.map((r) =>
		r
			.map((cell, i) => (i === r.length - 1 ? cell : cell.padEnd(widths[i]!)))
			.join("  "),
	);
}
