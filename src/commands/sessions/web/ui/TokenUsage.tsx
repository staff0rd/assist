import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatTokens } from "./formatTokens";

const ITEM_SX = {
	display: "flex",
	alignItems: "center",
	gap: 0.25,
	color: "text.disabled",
	opacity: 0.6,
};

const ICON_SX = { fontSize: "0.85rem", mx: "-0.15em" };

export function TokenUsage({
	totalIn,
	totalOut,
}: {
	totalIn?: number;
	totalOut?: number;
}) {
	if (totalIn === undefined && totalOut === undefined) return null;
	return (
		<>
			<Box sx={ITEM_SX}>
				<Typography variant="caption">{formatTokens(totalIn ?? 0)}</Typography>
				<ArrowUpwardIcon sx={ICON_SX} />
			</Box>
			<Box sx={ITEM_SX}>
				<Typography variant="caption">{formatTokens(totalOut ?? 0)}</Typography>
				<ArrowDownwardIcon sx={ICON_SX} />
			</Box>
		</>
	);
}
