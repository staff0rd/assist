import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { raisedBgcolor } from "../designSystem/raisedBgcolor";

const chipSx = {
	display: "inline-flex",
	alignItems: "center",
	gap: 0.75,
	height: 32,
	px: 1.25,
	borderRadius: "16px",
	border: 1,
	borderColor: "divider",
	bgcolor: raisedBgcolor,
	fontFamily: "fontFamilyMono",
	fontSize: 13,
	maxWidth: 120,
	overflow: "hidden",
	whiteSpace: "nowrap",
} as const;

export function PhoneNodeChip({
	name,
	reconnecting,
}: {
	name: string | undefined;
	reconnecting: boolean;
}) {
	return (
		<Box sx={chipSx} data-testid="phone-node-chip">
			<Box
				sx={{
					width: 8,
					height: 8,
					flex: "none",
					borderRadius: "50%",
					bgcolor: (t: Theme) =>
						reconnecting ? t.palette.warning.main : t.palette.success.main,
				}}
			/>
			{name ?? "…"}
		</Box>
	);
}
