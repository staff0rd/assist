import type { SxProps, Theme } from "@mui/material";
import { alpha, ButtonBase, Chip, Typography } from "@mui/material";
import type { BacklogItemSummary } from "../types";
import { canPlay } from "./canPlay";
import { InProgressChip } from "./InProgressChip";
import { PlayAction } from "./PlayAction";
import { StatusIcon } from "./StatusIcon";
import { typeChipColors } from "./typeChipColors";

const baseCardSx = {
	display: "flex",
	alignItems: "center",
	gap: 1.5,
	width: "100%",
	textAlign: "left",
	p: 2,
	mb: 1,
	borderRadius: 2,
	border: 1,
	borderColor: "divider",
	bgcolor: "background.paper",
	transition: "box-shadow 0.2s",
	"&:hover": { boxShadow: 3 },
} as const;

const cardSx: SxProps<Theme> = baseCardSx;

const inProgressCardSx: SxProps<Theme> = {
	...baseCardSx,
	borderColor: "warning.main",
	borderLeft: 4,
	borderLeftColor: "warning.main",
	bgcolor: (theme: Theme) => alpha(theme.palette.warning.main, 0.08),
};

const idSx: SxProps<Theme> = { color: "text.disabled", flexShrink: 0 };
const nameSx: SxProps<Theme> = { fontWeight: 500, flex: 1, textAlign: "left" };

const chipSx: SxProps<Theme> = {
	flexShrink: 0,
	fontWeight: 500,
	fontSize: "0.75rem",
	height: 22,
};

export function ItemCard({
	item,
	onSelect,
}: {
	item: BacklogItemSummary;
	onSelect: () => void;
}) {
	const inProgress = item.status === "in-progress";
	return (
		<ButtonBase onClick={onSelect} sx={inProgress ? inProgressCardSx : cardSx}>
			<StatusIcon status={item.status} />
			<Chip
				label={item.type}
				size="small"
				color={typeChipColors[item.type]}
				sx={chipSx}
			/>
			<Typography variant="body2" sx={idSx}>
				#{item.id}
			</Typography>
			<Typography sx={nameSx}>{item.name}</Typography>
			{inProgress && <InProgressChip />}
			{canPlay(item) && <PlayAction itemId={item.id} compact />}
		</ButtonBase>
	);
}
