import type { NodeRowData } from "./nodeRows";
import { needsAttention } from "./nodeStatus";

export function nodesSummary(rows: NodeRowData[]): string {
	const linked = rows.filter((row) => !row.local);
	if (linked.length === 0)
		return "Only this node · link another machine to run sessions on it from here";
	const up = linked.filter((row) => row.link?.state === "connected").length;
	const attention = rows.filter((row) => needsAttention(row.status)).length;
	const tail = attention
		? `${attention} need${attention === 1 ? "s" : ""} attention`
		: "all up to date";
	return `This node and ${linked.length} linked · ${up} connected · ${tail}`;
}
