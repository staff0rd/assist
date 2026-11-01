import {
	bigint,
	doublePrecision,
	index,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

type JobKind = "inbox-scan" | "review";
export type JobTrigger = "scheduled" | "manual";
export type JobStatus = "running" | "finished" | "failed";

export const jobRuns = pgTable(
	"job_runs",
	{
		id: integer().generatedByDefaultAsIdentity().primaryKey(),
		kind: text().$type<JobKind>().notNull(),
		trigger: text().$type<JobTrigger>().notNull(),
		model: text(),
		startedAt: timestamp("started_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		finishedAt: timestamp("finished_at", { withTimezone: true }),
		durationMs: bigint("duration_ms", { mode: "number" }),
		inputTokens: bigint("input_tokens", { mode: "number" })
			.notNull()
			.default(0),
		outputTokens: bigint("output_tokens", { mode: "number" })
			.notNull()
			.default(0),
		cacheReadTokens: bigint("cache_read_tokens", { mode: "number" })
			.notNull()
			.default(0),
		cacheWriteTokens: bigint("cache_write_tokens", { mode: "number" })
			.notNull()
			.default(0),
		costUsd: doublePrecision("cost_usd"),
		status: text().$type<JobStatus>().notNull().default("running"),
		detail: text(),
		repo: text(),
		prNumber: integer("pr_number"),
		reviewer: text(),
	},
	(t) => [index("job_runs_started_at_idx").on(t.startedAt)],
);
