import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { raisedBgcolor } from "../designSystem/raisedBgcolor";
import { NodeDot, type NodeDotTone } from "../HomeNodeGate/NodeDot";
import { touchTarget } from "../designSystem/touchTarget";

const chipSx = {
	display: "inline-flex",
	alignItems: "center",
	gap: 0.75,
	height: touchTarget,
	pl: 1.125,
	pr: 0.75,
	borderRadius: "24px",
	border: 1,
	borderColor: "divider",
	bgcolor: raisedBgcolor,
	color: "text.primary",
	fontFamily: "fontFamilyMono",
	fontSize: 13,
	maxWidth: 140,
	justifyContent: "flex-start",
} as const;

const nameSx = {
	minWidth: 0,
	overflow: "hidden",
	whiteSpace: "nowrap",
	textOverflow: "ellipsis",
} as const;

export function PhoneNodeChip({
	name,
	tone,
	onClick,
}: {
	name: string | undefined;
	tone: NodeDotTone;
	onClick?: () => void;
}) {
	return (
		<ButtonBase
			sx={chipSx}
			onClick={onClick}
			disabled={!onClick}
			aria-label="Nodes"
			data-testid="phone-node-chip"
		>
			<NodeDot tone={tone} />
			<Box component="span" sx={nameSx}>
				{name ?? "…"}
			</Box>
			{onClick && <ExpandMoreIcon sx={{ fontSize: 16, flex: "none" }} />}
		</ButtonBase>
	);
}
