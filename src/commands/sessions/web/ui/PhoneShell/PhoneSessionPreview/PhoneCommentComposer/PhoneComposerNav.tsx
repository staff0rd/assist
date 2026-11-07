import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { touchTarget } from "../../../designSystem/touchTarget";

const navSx = {
	flex: "none",
	display: "grid",
	gridTemplateColumns: "1fr auto 1fr",
	alignItems: "center",
	px: 1.5,
	borderBottom: 1,
	borderColor: "divider",
} as const;

const leadingSx = {
	justifySelf: "start",
	color: "primary.main",
	fontSize: 16,
	minHeight: touchTarget,
	px: 0.5,
	borderRadius: 1,
} as const;

export function PhoneComposerNav({
	title,
	leading,
	onLeading,
}: {
	title: string;
	leading: string;
	onLeading: () => void;
}) {
	return (
		<Box sx={navSx}>
			<ButtonBase sx={leadingSx} onClick={onLeading}>
				{leading}
			</ButtonBase>
			<Box component="h2" sx={{ m: 0, fontSize: 17, fontWeight: 600 }}>
				{title}
			</Box>
		</Box>
	);
}
