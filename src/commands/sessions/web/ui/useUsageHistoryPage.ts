import { useEffect, useState } from "react";
import type { UsagePeakRow } from "../../../../shared/db/listUsagePeaks";

const PAGE_SIZE = 30;

type UsageHistoryPage = { rows: UsagePeakRow[]; total: number };

async function fetchUsageHistory(page: number): Promise<UsageHistoryPage> {
	const res = await fetch(
		`/api/usage/history?page=${page}&pageSize=${PAGE_SIZE}`,
	);
	return res.json();
}

export function useUsageHistoryPage() {
	const [page, setPage] = useState(0);
	const [rows, setRows] = useState<UsagePeakRow[]>([]);
	const [total, setTotal] = useState(0);
	const [loaded, setLoaded] = useState(false);
	const [fetching, setFetching] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setFetching(true);
		fetchUsageHistory(page).then((data) => {
			if (cancelled) return;
			setRows(data.rows);
			setTotal(data.total);
			setLoaded(true);
			setFetching(false);
		});
		return () => {
			cancelled = true;
		};
	}, [page]);

	useEffect(() => {
		if (total === 0) return;
		const lastPage = Math.ceil(total / PAGE_SIZE) - 1;
		if (page > lastPage) setPage(lastPage);
	}, [page, total]);

	return { page, setPage, rows, total, loaded, fetching, pageSize: PAGE_SIZE };
}
