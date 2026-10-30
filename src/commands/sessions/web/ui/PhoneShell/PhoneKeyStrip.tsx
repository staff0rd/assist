import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import type { PointerEvent } from "react";
import { raisedBgcolor } from "../designSystem/raisedBgcolor";
import { phoneKeys } from "./phoneKeys";

const stripSx = {
	flex: "none",
	display: "flex",
	gap: 0.75,
	px: 1,
	py: 0.75,
	overflowX: "auto",
	scrollbarWidth: "none",
	"&::-webkit-scrollbar": { display: "none" },
	bgcolor: "background.paper",
	borderTop: 1,
	borderColor: "divider",
} as const;

const keySx = {
	flex: "none",
	minWidth: 44,
	height: 36,
	px: 1,
	borderRadius: 1,
	border: 1,
	borderColor: "divider",
	bgcolor: raisedBgcolor,
	color: "text.primary",
	fontFamily: "fontFamilyMono",
	fontSize: 13,
} as const;

const keepKeyboardOpen = (e: PointerEvent) => e.preventDefault();

type Props = {
	waiting: boolean;
	onKey: (data: string) => void;
};

export function PhoneKeyStrip({ waiting, onKey }: Props) {
	return (
		<Box sx={stripSx} data-testid="phone-key-strip">
			{phoneKeys(waiting).map((key) => (
				<ButtonBase
					key={key.label}
					sx={{ ...keySx, ...(key.warn && { color: "error.main" }) }}
					onPointerDown={keepKeyboardOpen}
					onClick={() => onKey(key.data)}
				>
					{key.label}
				</ButtonBase>
			))}
		</Box>
	);
}
