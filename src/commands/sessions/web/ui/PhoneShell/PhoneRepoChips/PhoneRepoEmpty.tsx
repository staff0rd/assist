import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { touchTarget } from "../../designSystem/touchTarget";
import { phoneEmptySx } from "../phoneEmptySx";

const buttonSx = {
	minHeight: touchTarget,
	px: 1.5,
	color: "primary.main",
	fontSize: 15,
	fontWeight: 500,
	fontFamily: "inherit",
} as const;

export function PhoneRepoEmpty({
	message,
	onShowAll,
}: {
	message: string;
	onShowAll: () => void;
}) {
	return (
		<Box
			sx={{
				...phoneEmptySx,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 0.5,
			}}
		>
			<span>{message}</span>
			<ButtonBase sx={buttonSx} onClick={onShowAll}>
				Show all repos
			</ButtonBase>
		</Box>
	);
}
