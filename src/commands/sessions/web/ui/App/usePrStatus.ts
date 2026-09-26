import { useEffect, useState } from "react";
import type { PrSummary } from "../../prList";
import type { SessionStatus } from "../types";
import { useApiNode } from "../useApiNode";
import { withNode } from "../withNode";

export function usePrStatus(
	cwd: string | undefined,
	prNumber: number | undefined,
	status: SessionStatus,
): PrSummary | null {
	const [pr, setPr] = useState<PrSummary | null>(null);
	const node = useApiNode();

	useEffect(() => {
		if (!cwd) {
			setPr(null);
			return;
		}
		let cancelled = false;
		const numberParam = prNumber !== undefined ? `&number=${prNumber}` : "";
		fetch(
			withNode(
				`/api/pr-status?cwd=${encodeURIComponent(cwd)}${numberParam}`,
				node,
			),
		)
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
	}, [cwd, node, prNumber, status]);

	return pr;
}
