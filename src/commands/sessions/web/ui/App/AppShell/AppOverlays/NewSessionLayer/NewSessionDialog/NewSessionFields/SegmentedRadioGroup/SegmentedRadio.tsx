import ButtonBase from "@mui/material/ButtonBase";
import type { ReactNode } from "react";

const radioSx = {
	px: 1.5,
	borderRadius: 0.75,
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	"&:hover": { color: "text.primary", bgcolor: "action.hover" },
	"&[aria-checked='true']": {
		color: "primary.main",
		bgcolor: "action.selected",
	},
	"&.Mui-focusVisible": { outline: 2, outlineColor: "primary.main" },
} as const;

export function SegmentedRadio({
	value,
	label,
	checked,
	autoFocus,
	onSelect,
}: {
	value: string;
	label: ReactNode;
	checked: boolean;
	autoFocus: boolean;
	onSelect: () => void;
}) {
	return (
		<ButtonBase
			role="radio"
			aria-checked={checked}
			data-value={value}
			tabIndex={checked ? 0 : -1}
			autoFocus={autoFocus && checked}
			onClick={onSelect}
			sx={radioSx}
		>
			{label}
		</ButtonBase>
	);
}
