import { useEffect, useState } from "react";

type Result = { cwd: string; configured: boolean };

async function fetchConfigured(cwd: string): Promise<boolean> {
	const res = await fetch(
		`/api/releases/configured?cwd=${encodeURIComponent(cwd)}`,
	);
	if (!res.ok) return false;
	const body = await res.json();
	return body?.configured === true;
}

export function useReleasesConfigured(cwd: string): boolean {
	const [result, setResult] = useState<Result | null>(null);

	useEffect(() => {
		if (!cwd) return;
		let cancelled = false;
		fetchConfigured(cwd)
			.catch(() => false)
			.then((configured) => {
				if (!cancelled) setResult({ cwd, configured });
			});
		return () => {
			cancelled = true;
		};
	}, [cwd]);

	return result?.cwd === cwd && result.configured;
}
