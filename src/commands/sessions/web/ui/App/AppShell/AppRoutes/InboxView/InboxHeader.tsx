import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { inboxStatusSummary } from "./inboxStatusSummary";
import { inboxStore } from "./inboxStore";
import { useInboxStatus } from "./useInboxStatus";
import { useInboxStatusError } from "./useInboxStatusError";

export function InboxHeader() {
	const status = useInboxStatus();
	const statusError = useInboxStatusError();
	const scanning = status?.scanning === true;
	const problem =
		statusError ??
		(status?.lastError && !scanning
			? `Last scan failed: ${status.lastError}`
			: undefined);
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
				{problem && (
					<Typography variant="body2" color="error">
						{problem}
					</Typography>
				)}
			</Box>
			<Tooltip title={scanning ? "A scan is already running" : ""}>
				<span>
					<Button
						variant="outlined"
						size="small"
						startIcon={<RefreshIcon />}
						disabled={scanning}
						onClick={() => void inboxStore.scan()}
					>
						{scanning ? "Scanning…" : "Scan now"}
					</Button>
				</span>
			</Tooltip>
		</Box>
	);
}
