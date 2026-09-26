import ButtonBase from "@mui/material/ButtonBase";

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
	"&.Mui-disabled": { color: "text.disabled" },
} as const;

export function SegmentedRadio({
	value,
	label,
	checked,
	autoFocus,
	onSelect,
	disabled,
}: {
	value: string;
	label: string;
	checked: boolean;
	autoFocus: boolean;
	onSelect: () => void;
	disabled: boolean;
}) {
	return (
		<ButtonBase
			role="radio"
			aria-checked={checked}
			disabled={disabled}
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
