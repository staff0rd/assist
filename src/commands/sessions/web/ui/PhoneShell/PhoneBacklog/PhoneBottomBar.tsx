import Box from "@mui/material/Box";
import type { ButtonProps } from "@mui/material/Button";
import type { ReactNode } from "react";
import { safeAreaInsets } from "../../designSystem/safeAreaInsets";
import { PhoneSheetButton } from "../PhoneSheetButton";

const barSx = {
	flex: "none",
	bgcolor: "background.paper",
	borderTop: 1,
	borderColor: "divider",
	pb: safeAreaInsets.bottom,
} as const;

export function PhoneBottomBar({
	children,
	button,
}: {
	children?: ReactNode;
	button: ButtonProps;
}) {
	return (
		<Box sx={barSx}>
			{children}
			<Box sx={{ pb: 1 }}>
				<PhoneSheetButton {...button} />
			</Box>
		</Box>
	);
}
