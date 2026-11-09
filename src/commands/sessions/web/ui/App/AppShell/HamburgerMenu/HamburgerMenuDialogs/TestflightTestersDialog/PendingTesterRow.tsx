import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { testerEmailSx, testerRowSx } from "./testerRowSx";

export function PendingTesterRow({ email }: { email: string }) {
	return (
		<Box sx={testerRowSx} data-testid="pending-tester-row" aria-busy>
			<Box
				component="span"
				sx={{ ...testerEmailSx, color: "text.secondary" }}
				title={email}
			>
				{email}
			</Box>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<CircularProgress size={14} aria-label="Adding" />
				<Typography variant="caption" color="text.secondary">
					Adding…
				</Typography>
			</Box>
		</Box>
	);
}
