/** Format identifier embedded in every dump header. */
export const DUMP_FORMAT = "assist-backlog-dump";

/** Dump container format version. Bump on any breaking layout change. */
export const DUMP_VERSION = 1;

/** A backlog table and the exact column order used in its COPY data. */
export type DumpTable = {
	name: string;
	columns: string[];
};

/**
 * The backlog tables to dump, in foreign-key order (parents before children) so
 * the same order can COPY rows back without deferring constraints on import.
 * `comments`, `links` and `plan_phases` reference `items`; `plan_tasks`
 * references `plan_phases`; `metadata` stands alone.
 */
export const DUMP_TABLES: DumpTable[] = [
	{
		name: "items",
		columns: [
			"id",
			"origin",
			"type",
			"name",
			"description",
			"acceptance_criteria",
			"status",
			"current_phase",
		],
	},
	{
		name: "comments",
		columns: ["id", "item_id", "idx", "text", "phase", "timestamp", "type"],
	},
	{ name: "links", columns: ["item_id", "type", "target_id"] },
	{ name: "plan_phases", columns: ["item_id", "idx", "name", "manual_checks"] },
	{ name: "plan_tasks", columns: ["item_id", "phase_idx", "idx", "task"] },
	{ name: "metadata", columns: ["key", "value"] },
];
