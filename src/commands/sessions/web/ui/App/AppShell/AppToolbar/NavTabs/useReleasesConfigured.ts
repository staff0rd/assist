import { useEffect, useState } from "react";

type Result = { cwd: string; configured: boolean | undefined };

async function fetchConfigured(cwd: string): Promise<boolean | undefined> {
	const res = await fetch(
		`/api/releases/configured?cwd=${encodeURIComponent(cwd)}`,
	);
	if (!res.ok) return undefined;
	const body = await res.json();
	return body?.configured === true;
}

export function useReleasesConfigured(cwd: string): boolean | undefined {
	const [result, setResult] = useState<Result | null>(null);

	useEffect(() => {
		if (!cwd) return;
		let cancelled = false;
		fetchConfigured(cwd)
			.catch(() => undefined)
			.then((configured) => {
				if (!cancelled) setResult({ cwd, configured });
			});
		return () => {
			cancelled = true;
		};
	}, [cwd]);

	return result?.cwd === cwd ? result.configured : undefined;
}
