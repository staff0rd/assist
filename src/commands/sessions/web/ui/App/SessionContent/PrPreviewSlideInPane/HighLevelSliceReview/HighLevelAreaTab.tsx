import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, ButtonBase, type Theme } from "@mui/material";
import { tabSx } from "./HighLevelAreaTab/tabSx";

const failureBadgeSx = {
	fontFamily: "fontFamilyMono",
	fontSize: 10,
	letterSpacing: 0,
	px: 0.625,
	borderRadius: 0.5,
	bgcolor: (t: Theme) => t.tokens.color.wash.error,
	color: "error.main",
} as const;

export function HighLevelAreaTab({
	label,
	count,
	failures,
	tick,
	selected,
	disabled,
	onSelect,
}: {
	label: string;
	count: number | undefined;
	failures: number;
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
			{failures > 0 && (
				<Box component="span" sx={failureBadgeSx}>
					{failures} fail
				</Box>
			)}
		</ButtonBase>
	);
}
