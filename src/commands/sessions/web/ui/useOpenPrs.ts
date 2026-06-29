import { useEffect, useState } from "react";
import type { PrSummary } from "../prList";

export function useOpenPrs(cwd: string | undefined): {
	prs: PrSummary[];
	loading: boolean;
} {
	const [prs, setPrs] = useState<PrSummary[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!cwd) {
			setPrs([]);
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		fetch(`/api/pr-list?cwd=${encodeURIComponent(cwd)}`)
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
	}, [cwd]);

	return { prs, loading };
}
