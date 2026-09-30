import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export function AllClear() {
	return (
		<Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
			<Typography variant="h6" component="h2">
				Nothing needs you here
			</Typography>
			<Typography sx={{ color: "text.secondary" }}>
				No peer PRs await your review and no issues are assigned to you.
			</Typography>
		</Paper>
	);
}
