import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { inboxStatusSummary } from "./inboxStatusSummary";
import { inboxStore } from "./inboxStore";
import { useInboxStatus } from "./useInboxStatus";

export function InboxHeader() {
	const status = useInboxStatus();
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "flex-end",
				gap: 2,
				flexWrap: "wrap",
				mb: 3,
			}}
		>
			<Box sx={{ flex: "1 1 auto" }}>
				<Typography variant="h5" component="h1">
					Inbox
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{inboxStatusSummary(status)}
				</Typography>
				{status?.lastError && !status.scanning && (
					<Typography variant="body2" color="error">
						Last scan failed: {status.lastError}
					</Typography>
				)}
			</Box>
			<Button
				variant="outlined"
				size="small"
				startIcon={<RefreshIcon />}
				disabled={!status || status.scanning}
				onClick={() => void inboxStore.scan().catch(() => {})}
			>
				{status?.scanning ? "Scanning…" : "Scan now"}
			</Button>
		</Box>
	);
}
