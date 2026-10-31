import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { PhoneSheetGrab } from "../PhoneSheetGrab";
import { touchTarget } from "../../designSystem/touchTarget";

const headerSx = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	gap: 1,
	px: 2,
	pt: 0.75,
	pb: 1.25,
} as const;

const actionSx = {
	color: "primary.main",
	fontSize: 16,
	minHeight: touchTarget,
	px: 0.5,
	borderRadius: 1,
} as const;

type Props = { title: string; actionLabel: string; onAction: () => void };

export function PhoneSheetHeader({ title, actionLabel, onAction }: Props) {
	return (
		<>
			<PhoneSheetGrab />
			<Box sx={headerSx}>
				<Box component="b" sx={{ fontSize: 17, fontWeight: 600 }}>
					{title}
				</Box>
				<ButtonBase sx={actionSx} onClick={onAction}>
					{actionLabel}
				</ButtonBase>
			</Box>
		</>
	);
}
