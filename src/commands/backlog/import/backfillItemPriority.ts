import type { DumpTable } from "../dump/DumpTable";

type Queryable = { query: (sql: string) => Promise<unknown> };

const RENUMBER_BY_ID_SQL = `
	UPDATE items i SET priority = r.rn
	FROM (
		SELECT id, ROW_NUMBER() OVER (PARTITION BY origin ORDER BY id) AS rn
		FROM items
	) r
	WHERE i.id = r.id
`;

export async function backfillItemPriority(
	client: Queryable,
	tables: DumpTable[],
): Promise<void> {
	const itemsTable = tables.find((t) => t.name === "items");
	if (!itemsTable || itemsTable.columns.includes("priority")) return;
	await client.query(RENUMBER_BY_ID_SQL);
}
