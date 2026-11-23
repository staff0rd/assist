import { useEffect, useState } from "react";
import { apiFetch } from "../../../../apiFetch";
import { reportCaughtError } from "../../../../clientFailures/reportCaughtError";
import { recheckWhileOpen } from "../../../../recheckWhileOpen";
import { useApiNode } from "../../../../useApiNode";
import { withNode } from "../../../../withNode";

type Result = { key: string; configured: boolean | undefined };

// why: config set from a terminal has no push channel to the page, so re-check while it is open
const RECHECK_MS = 30_000;

async function fetchConfigured(
	path: string,
	cwd: string,
	node?: string,
): Promise<boolean | undefined> {
	const res = await apiFetch(
		withNode(`${path}?cwd=${encodeURIComponent(cwd)}`, node),
	);
	if (!res.ok) return undefined;
	const body = await res.json();
	return body?.configured === true;
}

export function useCwdConfigured(
	path: string,
	cwd: string,
): boolean | undefined {
	const [result, setResult] = useState<Result | null>(null);
	const node = useApiNode();
	const key = `${node ?? ""}\0${cwd}`;

	useEffect(() => {
		if (!cwd) return;
		let cancelled = false;
		const check = () =>
			fetchConfigured(path, cwd, node)
				.catch((error: unknown) => {
					reportCaughtError(error, path);
					return undefined;
				})
				.then((configured) => {
					if (!cancelled) setResult({ key, configured });
				});
		const stop = recheckWhileOpen(check, RECHECK_MS);
		return () => {
			cancelled = true;
			stop();
		};
	}, [path, cwd, node, key]);

	return result?.key === key ? result.configured : undefined;
}
