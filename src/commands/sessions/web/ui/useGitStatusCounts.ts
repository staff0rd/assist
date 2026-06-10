import { useEffect, useState } from "react";
import type { GitStatusCounts } from "../parseGitStatus";

const POLL_INTERVAL_MS = 5000;

export function useGitStatusCounts(cwd: string): GitStatusCounts | null {
	const [counts, setCounts] = useState<GitStatusCounts | null>(null);

	useEffect(() => {
		if (!cwd) {
			setCounts(null);
			return;
		}
		let cancelled = false;
		const poll = async () => {
			try {
				const res = await fetch(
					`/api/git-status?cwd=${encodeURIComponent(cwd)}`,
				);
				const body = await res.json();
				if (!cancelled) setCounts(body ?? null);
			} catch {
				if (!cancelled) setCounts(null);
			}
		};
		poll();
		const id = setInterval(poll, POLL_INTERVAL_MS);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, [cwd]);

	return counts;
}
