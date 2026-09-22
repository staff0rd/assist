import { ghJson } from "./ghJson";

export type ReleaseRunJob = {
	name: string;
	status: string;
	conclusion: string | null;
	startedAt: string | null;
	completedAt: string | null;
	url: string | null;
};

type JobsResponse = {
	jobs?: {
		name?: string | null;
		status?: string | null;
		conclusion?: string | null;
		started_at?: string | null;
		completed_at?: string | null;
		html_url?: string | null;
	}[];
};

const JOB_PAGE = 100;

export async function runJobs(
	cwd: string,
	repo: string,
	runId: number,
): Promise<ReleaseRunJob[]> {
	const response = await ghJson<JobsResponse>(cwd, [
		"api",
		`repos/${repo}/actions/runs/${runId}/jobs?per_page=${JOB_PAGE}`,
	]);
	return (response.jobs ?? []).flatMap((job) =>
		job.name
			? [
					{
						name: job.name,
						status: job.status ?? "unknown",
						conclusion: job.conclusion ?? null,
						startedAt: job.started_at ?? null,
						completedAt: job.completed_at ?? null,
						url: job.html_url ?? null,
					},
				]
			: [],
	);
}
