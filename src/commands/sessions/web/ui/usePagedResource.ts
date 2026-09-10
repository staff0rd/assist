import { useEffect, useState } from "react";

export type PagedResult<T> = { rows: T[]; total: number };

export type PagedLoader<T> = (
	page: number,
	pageSize: number,
) => Promise<PagedResult<T>>;

export function usePagedResource<T>(
	load: PagedLoader<T>,
	pageSize: number,
	enabled = true,
) {
	const [page, setPage] = useState(0);
	const [rows, setRows] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [loaded, setLoaded] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [loadError, setLoadError] = useState<Error | null>(null);

	useEffect(() => {
		if (!enabled) return;
		let cancelled = false;
		setFetching(true);
		load(page, pageSize).then(
			(data) => {
				if (cancelled) return;
				setRows(data.rows);
				setTotal(data.total);
				setLoaded(true);
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

	useEffect(() => {
		if (total === 0) return;
		const lastPage = Math.ceil(total / pageSize) - 1;
		if (page > lastPage) setPage(lastPage);
	}, [page, pageSize, total]);

	return {
		rows,
		total,
		loaded,
		fetching,
		error: loadError,
		page,
		setPage,
		pageSize,
	};
}
