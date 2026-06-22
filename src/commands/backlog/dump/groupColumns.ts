import type { DumpTable } from "./DumpTable";

/** One column of a base table, pre-quoted for safe interpolation. */
export type ColumnRow = {
	table_name: string;
	quoted_table: string;
	quoted_column: string;
};

/** A table keyed by its raw (unquoted) name, used to match foreign-key edges. */
export type TableEntry = { raw: string; table: DumpTable };

/** Group ordinal-ordered column rows into one entry per table, preserving first-seen order. */
export function groupColumns(rows: ColumnRow[]): TableEntry[] {
	const byName = new Map<string, TableEntry>();
	for (const { table_name, quoted_table, quoted_column } of rows) {
		let entry = byName.get(table_name);
		if (!entry) {
			entry = { raw: table_name, table: { name: quoted_table, columns: [] } };
			byName.set(table_name, entry);
		}
		entry.table.columns.push(quoted_column);
	}
	return [...byName.values()];
}
