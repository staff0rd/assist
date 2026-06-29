import { useEffect, useState } from "react";
import type { PrSummary } from "../prList";

export function usePrStatus(cwd: string | undefined): PrSummary | null {
	const [pr, setPr] = useState<PrSummary | null>(null);

	useEffect(() => {
		if (!cwd) {
			setPr(null);
			return;
		}
		let cancelled = false;
		fetch(`/api/pr-status?cwd=${encodeURIComponent(cwd)}`)
			.then((res) => res.json())
			.then((body) => {
				if (!cancelled)
					setPr(typeof body?.pr?.number === "number" ? body.pr : null);
			})
			.catch(() => {
				if (!cancelled) setPr(null);
			});
		return () => {
			cancelled = true;
		};
	}, [cwd]);

	return pr;
}
