import { useEffect, useState } from "react";
import { apiFetch } from "../../../../apiFetch";
import { reportCaughtError } from "../../../../clientFailures/reportCaughtError";
import { useApiNode } from "../../../../useApiNode";
import { withNode } from "../../../../withNode";

export function useAutopilotRepos(): string[] {
	const node = useApiNode();
	const [repos, setRepos] = useState<string[]>([]);
	useEffect(() => {
		let cancelled = false;
		apiFetch(withNode("/api/autopilot/repos", node))
			.then((res) => (res.ok ? res.json() : { repos: [] }))
			.then((body: { repos?: string[] }) => {
				if (!cancelled) setRepos(body.repos ?? []);
			})
			.catch((error: unknown) => {
				reportCaughtError(error, "/api/autopilot/repos");
				if (!cancelled) setRepos([]);
			});
		return () => {
			cancelled = true;
		};
	}, [node]);
	return repos;
}
