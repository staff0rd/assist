import type { DumpTable } from "./DumpTable";
import { type ColumnRow, groupColumns, type TableEntry } from "./groupColumns";

export type { ColumnRow };

/** A child→parent foreign-key edge between two base tables. */
export type FkRow = { child: string; parent: string };

/** The FK dependency graph over present tables: in-degree plus parent→children. */
type Graph = {
	indegree: Map<string, number>;
	children: Map<string, string[]>;
};

/** Tally each table's referenced-table count and its dependents, ignoring absent tables. */
function buildGraph(names: string[], edges: FkRow[]): Graph {
	const present = new Set(names);
	const indegree = new Map(names.map((n) => [n, 0]));
	const children = new Map<string, string[]>();
	for (const { child, parent } of edges) {
		if (!present.has(child) || !present.has(parent)) continue;
		indegree.set(child, (indegree.get(child) ?? 0) + 1);
		children.set(parent, [...(children.get(parent) ?? []), child]);
	}
	return { indegree, children };
}

/** The earliest not-yet-emitted table whose dependencies are all satisfied. */
function nextReady(
	names: string[],
	emitted: Set<string>,
	indegree: Map<string, number>,
): string | undefined {
	return names.find((n) => !emitted.has(n) && (indegree.get(n) ?? 0) === 0);
}

/**
 * Order tables foreign-key-safe (parents before children) via a stable
 * topological sort: ties keep the input order, so the dump layout is
 * deterministic. Throws if the FK graph contains a cycle.
 */
function topoSort(entries: TableEntry[], edges: FkRow[]): DumpTable[] {
	const names = entries.map((e) => e.raw);
	const { indegree, children } = buildGraph(names, edges);
	const byRaw = new Map(entries.map((e) => [e.raw, e.table]));
	const ordered: DumpTable[] = [];
	const emitted = new Set<string>();
	while (ordered.length < entries.length) {
		const next = nextReady(names, emitted, indegree);
		if (!next)
			throw new Error("Cannot dump: foreign-key cycle between tables.");
		emitted.add(next);
		ordered.push(byRaw.get(next)!);
		for (const child of children.get(next) ?? []) {
			indegree.set(child, (indegree.get(child) ?? 0) - 1);
		}
	}
	return ordered;
}

/**
 * Turn raw introspection rows into the dump's table list: one entry per base
 * table with its columns in ordinal order, ordered foreign-key-safe so the same
 * sequence COPYs rows back in without deferring constraints.
 */
export function orderDumpTables(
	columnRows: ColumnRow[],
	fkRows: FkRow[],
): DumpTable[] {
	return topoSort(groupColumns(columnRows), fkRows);
}
