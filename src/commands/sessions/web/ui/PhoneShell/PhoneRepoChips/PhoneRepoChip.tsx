import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { alpha, type Theme } from "@mui/material/styles";
import { raisedBgcolor } from "../../designSystem/raisedBgcolor";
import { tokenBadgeSx } from "../../designSystem/tokenBadgeSx";
import { touchTarget } from "../../designSystem/touchTarget";

const chipSx = {
	flex: "none",
	minHeight: touchTarget,
	fontFamily: "inherit",
	"& > .pill": {
		display: "flex",
		alignItems: "center",
		gap: 0.75,
		height: (t: Theme) => t.tokens.density.chip.height,
		px: 1.5,
		borderRadius: (t: Theme) => `${t.tokens.density.chip.height / 2}px`,
		border: 1,
		borderColor: (t: Theme) => t.tokens.color.lineSoft,
		bgcolor: raisedBgcolor,
		color: "text.secondary",
		fontSize: 14,
		fontWeight: 500,
		whiteSpace: "nowrap",
	},
	"&[aria-checked='true'] > .pill": {
		bgcolor: (t: Theme) => t.tokens.color.selected,
		borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.45),
		color: "text.primary",
	},
} as const;

const dotSx = {
	width: (t: Theme) => t.tokens.density.chip.dot,
	height: (t: Theme) => t.tokens.density.chip.dot,
	borderRadius: "50%",
	bgcolor: "warning.main",
} as const;

export function PhoneRepoChip({
	label,
	count,
	attention,
	checked,
	onSelect,
}: {
	label: string;
	count: number;
	attention?: boolean;
	checked: boolean;
	onSelect: () => void;
}) {
	return (
		<ButtonBase
			role="radio"
			aria-checked={checked}
			sx={chipSx}
			onClick={onSelect}
		>
			<span className="pill">
				{attention && (
					<Box component="span" role="img" aria-label="needs you" sx={dotSx} />
				)}
				<span>{label}</span>
				<Box
					component="span"
					data-testid="repo-chip-count"
					sx={tokenBadgeSx(checked ? "primary" : "neutral")}
				>
					{count}
				</Box>
			</span>
		</ButtonBase>
	);
}
