import { useEffect, useState } from "react";
import { apiFetch } from "../../../../apiFetch";
import { reportCaughtError } from "../../../../clientFailures/reportCaughtError";
import { recheckWhileOpen } from "../../../../recheckWhileOpen";
import { useApiNode } from "../../../../useApiNode";
import { withNode } from "../../../../withNode";

// why: config set from a terminal has no push channel to the page, so re-check while it is open
const RECHECK_MS = 30_000;

export function useAutopilotRepos(): string[] {
	const node = useApiNode();
	const [repos, setRepos] = useState<string[]>([]);
	useEffect(() => {
		let cancelled = false;
		const check = () =>
			apiFetch(withNode("/api/autopilot/repos", node))
				.then((res) => (res.ok ? res.json() : { repos: [] }))
				.then((body: { repos?: string[] }) => {
					if (!cancelled) setRepos(body.repos ?? []);
				})
				.catch((error: unknown) => {
					reportCaughtError(error, "/api/autopilot/repos");
					if (!cancelled) setRepos([]);
				});
		const stop = recheckWhileOpen(check, RECHECK_MS);
		return () => {
			cancelled = true;
			stop();
		};
	}, [node]);
	return repos;
}
