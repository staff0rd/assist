import type { BacklogDatabase } from "./Db";
import { jobRuns } from "./jobRuns";

type CompletedJobRun = Omit<typeof jobRuns.$inferInsert, "id"> & {
	status: "finished" | "failed";
};

export async function recordJobRun(
	db: BacklogDatabase,
	run: CompletedJobRun,
): Promise<void> {
	await db.insert(jobRuns).values(run);
}
