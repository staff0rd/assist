import { useEffect, useState } from "react";
import type { PrSummary } from "../prList";
import type { SessionStatus } from "./types";

export function usePrStatus(
	cwd: string | undefined,
	prNumber: number | undefined,
	status: SessionStatus,
): PrSummary | null {
	const [pr, setPr] = useState<PrSummary | null>(null);

	useEffect(() => {
		if (!cwd) {
			setPr(null);
			return;
		}
		let cancelled = false;
		const numberParam = prNumber !== undefined ? `&number=${prNumber}` : "";
		fetch(`/api/pr-status?cwd=${encodeURIComponent(cwd)}${numberParam}`)
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
	}, [cwd, prNumber, status]);

	return pr;
}
