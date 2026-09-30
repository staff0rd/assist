import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router";
import { NextPeersNote } from "./NextHeader/NextPeersNote";

export function NextHeader({
	loading,
	peers,
	onRefresh,
}: {
	loading: boolean;
	peers?: string[];
	onRefresh: () => void;
}) {
	return (
		<Stack spacing={0.5} sx={{ mb: 2 }}>
			<Stack direction="row" spacing={2} sx={{ alignItems: "baseline" }}>
				<Typography variant="h6" sx={{ flex: 1 }}>
					Next
				</Typography>
				<Link
					component={RouterLink}
					to="/config?search=next"
					underline="hover"
					variant="body2"
				>
					Next settings
				</Link>
				<Button size="small" onClick={onRefresh} disabled={loading}>
					Refresh
				</Button>
			</Stack>
			{peers && <NextPeersNote peers={peers} />}
		</Stack>
	);
}
