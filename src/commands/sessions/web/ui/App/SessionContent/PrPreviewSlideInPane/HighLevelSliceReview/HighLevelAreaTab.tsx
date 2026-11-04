import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, ButtonBase } from "@mui/material";

function tabSx(selected: boolean) {
	return {
		height: "100%",
		px: 1.25,
		gap: 0.75,
		flexShrink: 0,
		fontSize: 12,
		fontWeight: 500,
		letterSpacing: "0.04em",
		textTransform: "uppercase",
		whiteSpace: "nowrap",
		color: selected ? "primary.main" : "text.secondary",
		borderBottom: 2,
		borderColor: selected ? "primary.main" : "transparent",
		"&:hover": { color: selected ? "primary.main" : "text.primary" },
		"&.Mui-disabled": { color: "text.disabled" },
	} as const;
}

export function HighLevelAreaTab({
	label,
	count,
	tick,
	selected,
	disabled,
	onSelect,
}: {
	label: string;
	count: number | undefined;
	tick: boolean | undefined;
	selected: boolean;
	disabled: boolean;
	onSelect: () => void;
}) {
	const Ring = tick ? CheckCircleIcon : RadioButtonUncheckedIcon;
	return (
		<ButtonBase
			role="tab"
			aria-selected={selected}
			disabled={disabled}
			onClick={onSelect}
			sx={tabSx(selected)}
		>
			{tick !== undefined && (
				<Ring
					titleAccess={tick ? "ticked" : "not ticked"}
					sx={{ fontSize: 14, color: tick ? "success.main" : "inherit" }}
				/>
			)}
			{label}
			{count !== undefined && (
				<Box
					component="span"
					sx={{ fontFamily: "fontFamilyMono", color: "text.disabled" }}
				>
					{count}
				</Box>
			)}
		</ButtonBase>
	);
}
