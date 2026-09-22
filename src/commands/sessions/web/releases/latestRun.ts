import { ghJson } from "./ghJson";
import type { ReleaseRunState } from "./types";

type RunsResponse = {
	workflow_runs?: {
		id: number;
		run_number: number;
		html_url: string;
		head_sha: string;
		status: string | null;
		run_started_at?: string | null;
	}[];
};

type LatestRun = ReleaseRunState & { id: number };

export async function latestRun(
	cwd: string,
	repo: string,
	workflow: string,
): Promise<LatestRun | null> {
	const path = `repos/${repo}/actions/workflows/${encodeURIComponent(workflow)}/runs?per_page=1&exclude_pull_requests=true`;
	const response = await ghJson<RunsResponse>(cwd, ["api", path]);
	const run = response.workflow_runs?.[0];
	if (!run) return null;
	return {
		id: run.id,
		number: run.run_number,
		url: run.html_url,
		headSha: run.head_sha,
		status: run.status ?? "unknown",
		startedAt: run.run_started_at ?? null,
	};
}
