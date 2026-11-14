import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { repoLabel } from "../repoLabel";
import { raisedBgcolor } from "../../designSystem/raisedBgcolor";

export function RulesHeader({ cwd }: { cwd: string }) {
	return (
		<Box sx={{ mb: 2 }}>
			<Typography variant="h6">Rules</Typography>
			<Typography variant="body2" color="text.secondary">
				Every rule your sessions follow in{" "}
				<Box
					component="span"
					sx={{
						fontFamily: "fontFamilyMono",
						fontSize: "caption.fontSize",
						bgcolor: raisedBgcolor,
						borderRadius: 1,
						px: 1,
						py: 0.25,
					}}
				>
					{repoLabel(cwd)}
				</Box>
				, by where it lives
			</Typography>
		</Box>
	);
}
