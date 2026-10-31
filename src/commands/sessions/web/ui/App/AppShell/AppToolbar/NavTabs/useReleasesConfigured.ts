import { useEffect, useState } from "react";
import { apiFetch } from "../../../../apiFetch";
import { reportCaughtError } from "../../../../clientFailures/reportCaughtError";
import { useApiNode } from "../../../../useApiNode";
import { withNode } from "../../../../withNode";

type Result = { key: string; configured: boolean | undefined };

async function fetchConfigured(
	cwd: string,
	node?: string,
): Promise<boolean | undefined> {
	const res = await apiFetch(
		withNode(`/api/releases/configured?cwd=${encodeURIComponent(cwd)}`, node),
	);
	if (!res.ok) return undefined;
	const body = await res.json();
	return body?.configured === true;
}

export function useReleasesConfigured(cwd: string): boolean | undefined {
	const [result, setResult] = useState<Result | null>(null);
	const node = useApiNode();
	const key = `${node ?? ""}\0${cwd}`;

	useEffect(() => {
		if (!cwd) return;
		let cancelled = false;
		fetchConfigured(cwd, node)
			.catch((error: unknown) => {
				reportCaughtError(error, "releases configured");
				return undefined;
			})
			.then((configured) => {
				if (!cancelled) setResult({ key, configured });
			});
		return () => {
			cancelled = true;
		};
	}, [cwd, node, key]);

	return result?.key === key ? result.configured : undefined;
}
