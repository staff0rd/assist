import type { BacklogDatabase } from "./Db";
import { jobRuns } from "./jobRuns";

type NewJobRun = Pick<
	typeof jobRuns.$inferInsert,
	"kind" | "trigger" | "startedAt" | "model" | "repo" | "prNumber" | "reviewer"
>;

export async function startJobRun(
	db: BacklogDatabase,
	run: NewJobRun,
): Promise<number> {
	const [row] = await db
		.insert(jobRuns)
		.values({ ...run, status: "running" })
		.returning({ id: jobRuns.id });
	return row.id;
}
