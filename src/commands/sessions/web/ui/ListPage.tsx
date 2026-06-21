import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { type ReactNode, useEffect, useState } from "react";

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

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Container maxWidth="md" sx={{ py: 3, px: 2 }}>
			<Typography variant="h6" sx={{ mb: 2 }}>
				{title}
			</Typography>
			{rows.length === 0 ? (
				<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
					{emptyMessage}
				</Typography>
			) : (
				children(rows)
			)}
		</Container>
	);
};
