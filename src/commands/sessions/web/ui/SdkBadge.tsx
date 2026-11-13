import Box from "@mui/material/Box";
import { tokenBadgeSx } from "./designSystem/tokenBadgeSx";

export function SdkBadge({ label }: { label: string }) {
	return (
		<Box component="span" sx={tokenBadgeSx("primary")}>
			{label}
		</Box>
	);
}
