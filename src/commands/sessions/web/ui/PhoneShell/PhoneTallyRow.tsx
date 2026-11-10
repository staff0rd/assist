import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import type { Theme } from "@mui/material/styles";
import { tokenBadgeSx } from "../designSystem/tokenBadgeSx";

const tallySx = {
	width: "100%",
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	px: 2,
	py: 1.5,
	fontSize: 15,
	color: "text.secondary",
	borderBottom: 1,
	borderColor: (t: Theme) => t.tokens.color.lineSoft,
} as const;

const needsYouSx = [tokenBadgeSx("warning"), { alignSelf: "center" }];

export function PhoneTallyRow({
	label,
	glyph,
	glyphColor,
	count,
	needsYou = 0,
	expanded,
	onToggle,
}: {
	label: string;
	glyph: string;
	glyphColor: string;
	count: number;
	needsYou?: number;
	expanded: boolean;
	onToggle: () => void;
}) {
	return (
		<ButtonBase sx={tallySx} onClick={onToggle} aria-expanded={expanded}>
			<Box component="span" sx={{ display: "flex", gap: 1 }}>
				<Box component="span" sx={{ color: glyphColor }}>
					{glyph}
				</Box>
				{label}
				<Box component="span" sx={{ fontFamily: "fontFamilyMono" }}>
					{count}
				</Box>
				{needsYou > 0 && (
					<Box component="span" data-testid="tally-needs-you" sx={needsYouSx}>
						{`${needsYou} need${needsYou === 1 ? "s" : ""} you`}
					</Box>
				)}
			</Box>
			{expanded ? (
				<ExpandLessIcon fontSize="small" />
			) : (
				<ExpandMoreIcon fontSize="small" />
			)}
		</ButtonBase>
	);
}
