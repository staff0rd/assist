import { useEffect, useState } from "react";
import type { ReleaseCompare } from "../../../../releases/types";
import { apiFetch } from "../../../apiFetch";
import { reportCaughtError } from "../../../clientFailures/reportCaughtError";
import { useApiNode } from "../../../useApiNode";
import { useRepoSelectionContext } from "../../../useRepoSelectionContext";
import { withNode } from "../../../withNode";

export type ReleaseCompareView =
	| { status: "loading" }
	| { status: "error" }
	| { status: "loaded"; compare: ReleaseCompare };

function compareUrl(
	cwd: string,
	repo: string,
	base: string | null,
	head: string,
): string {
	const params = new URLSearchParams({ cwd, repo, head });
	if (base) params.set("base", base);
	return `/api/releases/compare?${params}`;
}

export function useReleaseCompare(
	open: boolean,
	repo: string,
	base: string | null,
	head: string,
): ReleaseCompareView {
	const { selectedCwd } = useRepoSelectionContext();
	const node = useApiNode();
	const [view, setView] = useState<ReleaseCompareView>({ status: "loading" });

	useEffect(() => {
		if (!open) return;
		let cancelled = false;
		setView({ status: "loading" });
		apiFetch(withNode(compareUrl(selectedCwd, repo, base, head), node))
			.then(async (res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const compare = (await res.json()) as ReleaseCompare;
				if (!cancelled) setView({ status: "loaded", compare });
			})
			.catch((error: unknown) => {
				reportCaughtError(error, "release compare");
				if (!cancelled) setView({ status: "error" });
			});
		return () => {
			cancelled = true;
		};
	}, [open, selectedCwd, node, repo, base, head]);

	return view;
}
