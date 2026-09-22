import type { ReleaseStream } from "../../../../shared/types";
import { latestRun } from "./latestRun";
import { matchRunJobs } from "./matchRunJobs";
import { runJobs } from "./runJobs";
import type { ReleaseRunNodeState, ReleaseRunState } from "./types";

type StreamRunState = {
	run: ReleaseRunState | null;
	byNode: Map<string, ReleaseRunNodeState>;
};

export async function streamRunState(
	cwd: string,
	stream: ReleaseStream,
): Promise<StreamRunState> {
	const run = await latestRun(cwd, stream.repo, stream.workflow);
	if (!run) return { run: null, byNode: new Map() };
	const { id, ...state } = run;
	const jobs = await runJobs(cwd, stream.repo, id);
	return { run: state, byNode: matchRunJobs(stream.nodes, jobs) };
}
