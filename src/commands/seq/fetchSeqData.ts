import { fetchSeq } from "./fetchSeq";
import { filterToSql } from "./filterToSql";
import type { SeqConnection, SeqEvent } from "./types";

type SeqDataResponse = {
	Columns: string[];
	Rows: unknown[][];
};

export async function fetchSeqData(
	conn: SeqConnection,
	filter: string,
	count: number,
	from: string,
): Promise<SeqEvent[]> {
	const sqlFilter = filterToSql(filter);
	const sql = `select @Timestamp, @Level, @Exception, @Message from stream where ${sqlFilter} order by @Timestamp desc limit ${count}`;

	const params = new URLSearchParams({ q: sql, fromDateUtc: from });
	const response = await fetchSeq(conn, "/api/data", params);

	const data: SeqDataResponse = await response.json();
	return mapDataToEvents(data);
}

/** Convert .NET ticks (100-ns intervals since 0001-01-01) to ISO string */
function ticksToIso(value: unknown): string {
	if (typeof value === "string") return value;
	const ticks = Number(value);
	const epochTicks = 621355968000000000;
	return new Date((ticks - epochTicks) / 10000).toISOString();
}

export function mapDataToEvents(data: SeqDataResponse): SeqEvent[] {
	const colIndex = new Map(data.Columns.map((c, i) => [c, i]));

	function col(name: string): number {
		const idx = colIndex.get(name) ?? colIndex.get(`@${name}`);
		if (idx === undefined) throw new Error(`Missing column: ${name}`);
		return idx;
	}

	const tsIdx = col("Timestamp");
	const levelIdx = col("Level");
	const exIdx = col("Exception");
	const msgIdx = col("Message");

	return data.Rows.map((row) => ({
		Timestamp: ticksToIso(row[tsIdx]),
		Level: String(row[levelIdx] ?? ""),
		Exception: row[exIdx] != null ? String(row[exIdx]) : undefined,
		Properties: [],
		MessageTemplateTokens: [{ Text: String(row[msgIdx] ?? "") }],
	}));
}
