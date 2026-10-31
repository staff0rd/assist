type RunJob = { name: string; conclusion: string | null };

const UPLOAD_JOB = /^TestFlight (v\S+)$/;

export function lastUploadedTag(
	runIds: number[],
	jobsOf: (runId: number) => RunJob[],
): string | undefined {
	for (const runId of runIds) {
		for (const job of jobsOf(runId)) {
			const tag = UPLOAD_JOB.exec(job.name)?.[1];
			if (tag && job.conclusion === "success") return tag;
		}
	}
	return undefined;
}
