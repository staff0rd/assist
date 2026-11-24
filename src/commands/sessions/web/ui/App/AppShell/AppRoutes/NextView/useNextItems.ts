import { useCallback, useEffect, useState } from "react";
import type { NextResponse } from "../../../../../next/types";
import { useApiNode } from "../../../../useApiNode";
import { loadNext, type NextLoaded } from "./loadNext";

type NextItemsView = {
	data: NextResponse | null;
	loading: boolean;
	error: string | null;
	refresh: () => void;
};

export function useNextItems(cwd: string): NextItemsView {
	const node = useApiNode();
	const key = JSON.stringify([cwd, node ?? null]);
	const [loaded, setLoaded] = useState<NextLoaded | null>(null);
	const [loading, setLoading] = useState(true);
	const [nonce, setNonce] = useState(0);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		void loadNext(key, cwd, node).then((next) => {
			if (cancelled) return;
			setLoaded(next);
			setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [cwd, node, key, nonce]);

	const refresh = useCallback(() => setNonce((n) => n + 1), []);
	const current = loaded?.key === key ? loaded : null;
	return {
		data: current?.data ?? null,
		loading: loading || !current,
		error: current?.error ?? null,
		refresh,
	};
}
