import { useEffect, useState } from "react";
import type { PrSummary } from "../../../../../../prList";
import { useApiNode } from "../../../../../useApiNode";
import { withNode } from "../../../../../withNode";

export function useOpenPrs(cwd: string | undefined): {
	prs: PrSummary[];
	loading: boolean;
} {
	const [prs, setPrs] = useState<PrSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const node = useApiNode();

	useEffect(() => {
		if (!cwd) {
			setPrs([]);
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		fetch(withNode(`/api/pr-list?cwd=${encodeURIComponent(cwd)}`, node))
			.then((res) => res.json())
			.then((body) => {
				if (cancelled) return;
				setPrs(Array.isArray(body?.prs) ? body.prs : []);
				setLoading(false);
			})
			.catch(() => {
				if (cancelled) return;
				setPrs([]);
				setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [cwd, node]);

	return { prs, loading };
}
