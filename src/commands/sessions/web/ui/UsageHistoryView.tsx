import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import type { UsagePeakRow } from "../../../../shared/db/listUsagePeaks";
import { UsagePeaksTable } from "./UsagePeaksTable";

async function fetchUsageHistory(): Promise<UsagePeakRow[]> {
	const res = await fetch("/api/usage/history");
	return res.json();
}

export function UsageHistoryView() {
	const [peaks, setPeaks] = useState<UsagePeakRow[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchUsageHistory()
			.then(setPeaks)
			.finally(() => setLoading(false));
	}, []);

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
				Usage history
			</Typography>
			{peaks.length === 0 ? (
				<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
					No usage peaks recorded yet.
				</Typography>
			) : (
				<UsagePeaksTable peaks={peaks} />
			)}
		</Container>
	);
}
