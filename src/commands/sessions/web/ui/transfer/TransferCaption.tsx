import Box from "@mui/material/Box";
import { type TransferTone, transferToneColor } from "./transferIndicator";

export function TransferCaption({
	tone,
	label,
}: {
	tone: TransferTone;
	label: string;
}) {
	return (
		<Box
			component="span"
			sx={{
				color: transferToneColor[tone],
				fontWeight: 500,
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis",
			}}
		>
			{label}
		</Box>
	);
}
