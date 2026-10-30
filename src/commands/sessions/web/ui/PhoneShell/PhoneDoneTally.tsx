import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import type { Theme } from "@mui/material/styles";
import { statusColors } from "../App/statusColors";
import { statusGlyph } from "../statusGlyph";

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

export function PhoneDoneTally({
	count,
	expanded,
	onToggle,
}: {
	count: number;
	expanded: boolean;
	onToggle: () => void;
}) {
	return (
		<ButtonBase sx={tallySx} onClick={onToggle} aria-expanded={expanded}>
			<Box component="span" sx={{ display: "flex", gap: 1 }}>
				<Box component="span" sx={{ color: statusColors.done }}>
					{statusGlyph.done}
				</Box>
				Done
				<Box component="span" sx={{ fontFamily: "fontFamilyMono" }}>
					{count}
				</Box>
			</Box>
			{expanded ? (
				<ExpandLessIcon fontSize="small" />
			) : (
				<ExpandMoreIcon fontSize="small" />
			)}
		</ButtonBase>
	);
}
