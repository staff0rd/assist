import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function NoLinkedNodes() {
	return (
		<Box sx={{ px: 2, py: 3.5, borderTop: 1, borderColor: "divider" }}>
			<Typography variant="body2" color="text.secondary" align="center">
				No linked nodes yet. Run{" "}
				<Box component="code" sx={{ fontFamily: "fontFamilyMono" }}>
					assist sessions nodes link
				</Box>{" "}
				on this machine.
			</Typography>
		</Box>
	);
}
