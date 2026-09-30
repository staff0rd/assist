import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function NextHeader({
	loading,
	onRefresh,
}: {
	loading: boolean;
	onRefresh: () => void;
}) {
	return (
		<Stack direction="row" sx={{ alignItems: "baseline", mb: 2 }}>
			<Typography variant="h6" sx={{ flex: 1 }}>
				Next
			</Typography>
			<Button size="small" onClick={onRefresh} disabled={loading}>
				Refresh
			</Button>
		</Stack>
	);
}
