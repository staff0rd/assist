import { type ReactNode, useEffect, useState } from "react";
import { PageShell } from "./PageShell";

/**
 * A titled page that fetches a list of rows, showing a spinner while loading,
 * an empty message when there are none, and otherwise the rendered rows. Shared
 * by the usage-history and backups views.
 */
type ListPageProps<T> = {
	title: string;
	emptyMessage: string;
	fetchRows: () => Promise<T[]>;
	children: (rows: T[]) => ReactNode;
};

export const ListPage = <T,>(props: ListPageProps<T>) => {
	const { title, emptyMessage, fetchRows, children } = props;
	const [rows, setRows] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchRows()
			.then(setRows)
			.finally(() => setLoading(false));
	}, [fetchRows]);

	return (
		<PageShell
			loading={loading}
			title={title}
			isEmpty={rows.length === 0}
			emptyMessage={emptyMessage}
		>
			{children(rows)}
		</PageShell>
	);
};
