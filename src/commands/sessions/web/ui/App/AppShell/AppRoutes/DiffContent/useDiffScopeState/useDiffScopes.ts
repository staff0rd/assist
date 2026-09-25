import { useEffect, useState } from "react";
import type { CommitRef } from "../../../../../../../../../shared/db/listCommitRefs";
import { diffQuery } from "../../diffQuery";

type DiffScopes = {
	commits: CommitRef[];
	branchBase: string | null;
	loaded: boolean;
};

const EMPTY: DiffScopes = { commits: [], branchBase: null, loaded: false };

export function useDiffScopes(cwd: string, sessionId?: string): DiffScopes {
	const [scopes, setScopes] = useState<DiffScopes>(EMPTY);

	useEffect(() => {
		if (!cwd) {
			setScopes(EMPTY);
			return;
		}
		let cancelled = false;
		const load = async () => {
			try {
				const res = await fetch(
					`/api/diff-scopes?${diffQuery(cwd, sessionId)}`,
				);
				const body = await res.json();
				if (!cancelled)
					setScopes({
						commits: body?.commits ?? [],
						branchBase: body?.branchBase ?? null,
						loaded: true,
					});
			} catch {
				if (!cancelled) setScopes({ ...EMPTY, loaded: true });
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [cwd, sessionId]);

	return scopes;
}
