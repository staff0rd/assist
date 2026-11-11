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
	buttons,
}: {
	children?: ReactNode;
	buttons: ButtonProps[];
}) {
	return (
		<Box sx={barSx}>
			{children}
			<Box sx={{ pb: 1 }}>
				{buttons.map((button) => (
					<PhoneSheetButton key={String(button.children)} {...button} />
				))}
			</Box>
		</Box>
	);
}
