import { useCallback, useEffect, useState } from "react";
import type { NextResponse } from "../../../../../next/types";
import { useApiNode } from "../../../../useApiNode";
import { withNode } from "../../../../withNode";

type NextItemsView = {
	data: NextResponse | null;
	loading: boolean;
	error: string | null;
	refresh: () => void;
};

async function fetchNext(cwd: string, node?: string): Promise<NextResponse> {
	const res = await fetch(
		withNode(`/api/next?cwd=${encodeURIComponent(cwd)}`, node),
	);
	const body = await res.json();
	if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
	return body as NextResponse;
}

export function useNextItems(cwd: string): NextItemsView {
	const node = useApiNode();
	const [data, setData] = useState<NextResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [nonce, setNonce] = useState(0);

	useEffect(() => {
		if (!cwd) {
			setData(null);
			setLoading(false);
			setError("No repo selected.");
			return;
		}
		let cancelled = false;
		setLoading(true);
		fetchNext(cwd, node)
			.then((next) => {
				if (cancelled) return;
				setData(next);
				setError(null);
			})
			.catch((error: unknown) => {
				if (cancelled) return;
				setData(null);
				setError(error instanceof Error ? error.message : "Failed to load.");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [cwd, node, nonce]);

	const refresh = useCallback(() => setNonce((n) => n + 1), []);
	return { data, loading, error, refresh };
}
