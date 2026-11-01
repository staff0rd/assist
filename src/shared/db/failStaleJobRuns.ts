import { and, eq, lt } from "drizzle-orm";
import type { BacklogDatabase } from "./Db";
import { jobRuns } from "./jobRuns";

export async function failStaleJobRuns(
	db: BacklogDatabase,
	{ startedBefore, detail }: { startedBefore: Date; detail: string },
): Promise<number> {
	const failed = await db
		.update(jobRuns)
		.set({ status: "failed", detail })
		.where(
			and(eq(jobRuns.status, "running"), lt(jobRuns.startedAt, startedBefore)),
		)
		.returning({ id: jobRuns.id });
	return failed.length;
}
