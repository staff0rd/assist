import type { ReleaseRunJob } from "./runJobs";
import type { ReleaseRunNodeState, ReleaseRunNodeStatus } from "./types";

const RUNNING_STATUSES = new Set([
	"queued",
	"in_progress",
	"pending",
	"requested",
]);

const UNREACHED_CONCLUSIONS = new Set(["skipped", "neutral"]);

export const UNREACHED_BY_RUN: ReleaseRunNodeState = {
	status: "idle",
	conclusion: null,
	startedAt: null,
	completedAt: null,
	url: null,
};

function statusOf(job: ReleaseRunJob): ReleaseRunNodeStatus {
	if (job.status === "waiting") return "gate";
	if (RUNNING_STATUSES.has(job.status)) return "running";
	if (job.conclusion === "success") return "ok";
	if (!job.conclusion || UNREACHED_CONCLUSIONS.has(job.conclusion))
		return "idle";
	return "fail";
}

export function runJobState(job: ReleaseRunJob): ReleaseRunNodeState {
	return {
		status: statusOf(job),
		conclusion: job.conclusion,
		startedAt: job.startedAt,
		completedAt: job.completedAt,
		url: job.url,
	};
}
