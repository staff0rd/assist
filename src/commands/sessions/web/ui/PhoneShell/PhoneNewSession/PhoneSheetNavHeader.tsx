import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { PhoneSheetGrab } from "../PhoneSheetGrab";
import { touchTarget } from "../../designSystem/touchTarget";

const headerSx = {
	display: "grid",
	gridTemplateColumns: "1fr auto 1fr",
	alignItems: "center",
	px: 2,
	pt: 0.75,
	pb: 1.25,
} as const;

const backSx = {
	justifySelf: "start",
	color: "primary.main",
	fontSize: 16,
	minHeight: touchTarget,
	px: 0.5,
	borderRadius: 1,
} as const;

export function PhoneSheetNavHeader({
	title,
	backLabel,
	onBack,
}: {
	title: string;
	backLabel: string;
	onBack: () => void;
}) {
	return (
		<>
			<PhoneSheetGrab />
			<Box sx={headerSx}>
				<ButtonBase sx={backSx} onClick={onBack}>
					{backLabel}
				</ButtonBase>
				<Box component="b" sx={{ fontSize: 17, fontWeight: 600 }}>
					{title}
				</Box>
			</Box>
		</>
	);
}
