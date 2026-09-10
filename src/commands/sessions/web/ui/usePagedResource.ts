import { useEffect, useState } from "react";

type PagedResult<T> = { rows: T[]; total: number };

type PagedLoader<P> = (page: number, pageSize: number) => Promise<P>;

export function usePagedResource<T, P extends PagedResult<T> = PagedResult<T>>(
	load: PagedLoader<P>,
	pageSize: number,
	enabled = true,
) {
	const [page, setPage] = useState(0);
	const [data, setData] = useState<P | null>(null);
	const [fetching, setFetching] = useState(false);
	const [loadError, setLoadError] = useState<Error | null>(null);

	useEffect(() => {
		if (!enabled) return;
		let cancelled = false;
		setFetching(true);
		load(page, pageSize).then(
			(next) => {
				if (cancelled) return;
				setData(next);
				setFetching(false);
			},
			(error: unknown) => {
				if (cancelled) return;
				setLoadError(error instanceof Error ? error : new Error(String(error)));
				setFetching(false);
			},
		);
		return () => {
			cancelled = true;
		};
	}, [load, page, pageSize, enabled]);

	const total = data?.total ?? 0;

	useEffect(() => {
		if (total === 0) return;
		const lastPage = Math.ceil(total / pageSize) - 1;
		if (page > lastPage) setPage(lastPage);
	}, [page, pageSize, total]);

	const rows: T[] = data?.rows ?? [];

	return {
		data,
		rows,
		total,
		loaded: data !== null,
		fetching,
		error: loadError,
		page,
		setPage,
		pageSize,
	};
}
