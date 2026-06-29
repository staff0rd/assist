import { useEffect, useState } from "react";

export function usePrStatus(cwd: string | undefined): number | null {
	const [number, setNumber] = useState<number | null>(null);

	useEffect(() => {
		if (!cwd) {
			setNumber(null);
			return;
		}
		let cancelled = false;
		fetch(`/api/pr-status?cwd=${encodeURIComponent(cwd)}`)
			.then((res) => res.json())
			.then((body) => {
				if (!cancelled)
					setNumber(typeof body?.number === "number" ? body.number : null);
			})
			.catch(() => {
				if (!cancelled) setNumber(null);
			});
		return () => {
			cancelled = true;
		};
	}, [cwd]);

	return number;
}
