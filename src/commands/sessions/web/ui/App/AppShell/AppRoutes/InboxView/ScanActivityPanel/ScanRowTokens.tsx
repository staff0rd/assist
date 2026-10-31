import Typography from "@mui/material/Typography";
import { formatTokens } from "../../../../../../../../../shared/formatTokens";

export function ScanRowTokens({ tokens }: { tokens: number | undefined }) {
	return (
		<Typography
			component="span"
			sx={{
				fontSize: "inherit",
				fontFamily: "fontFamilyMono",
				display: { xs: "none", sm: "inline" },
			}}
			color="text.disabled"
			noWrap
		>
			{tokens === undefined ? "" : formatTokens(tokens)}
		</Typography>
	);
}
