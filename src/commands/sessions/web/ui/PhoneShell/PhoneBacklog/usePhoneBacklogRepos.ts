import { useEffect, useMemo, useState } from "react";
import {
	fetchRepoSummaries,
	type RepoSummary,
} from "../../../../../backlog/web/ui/fetchRepoSummaries";
import { reportCaughtError } from "../../clientFailures/reportCaughtError";
import { LOCAL_NODE, mergeRepos } from "../../mergeRepos";
import type { SessionSocket } from "../../useSessionSocket";
import { nodeRepos } from "../PhoneNewSession/nodeRepos";

export type PhoneBacklogRepo = RepoSummary & { cwd: string };

export function usePhoneBacklogRepos(socket: SessionSocket) {
	const { currentCwd, history, requestHistory } = socket;
	const [repos, setRepos] = useState<PhoneBacklogRepo[] | undefined>();
	const knownKey = useMemo(
		() => nodeRepos(mergeRepos(currentCwd, history), LOCAL_NODE).join("\n"),
		[currentCwd, history],
	);

	useEffect(() => requestHistory(), [requestHistory]);

	useEffect(() => {
		const controller = new AbortController();
		const knownCwds = knownKey ? knownKey.split("\n") : [];
		fetchRepoSummaries({ knownCwds, signal: controller.signal })
			.then((summaries) =>
				setRepos(
					summaries.filter((s): s is PhoneBacklogRepo => Boolean(s.cwd)),
				),
			)
			.catch((error: unknown) => {
				if (controller.signal.aborted) return;
				reportCaughtError(error, "backlog repos");
				setRepos([]);
			});
		return () => controller.abort();
	}, [knownKey]);

	return repos;
}
