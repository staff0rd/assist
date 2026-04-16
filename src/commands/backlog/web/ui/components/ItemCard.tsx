import type { SxProps, Theme } from "@mui/material";
import { ButtonBase, Chip, Typography } from "@mui/material";
import type { BacklogItem } from "../types";

const statusIcons: Record<string, string> = {
	todo: "\u25cb",
	"in-progress": "\u25d4",
	done: "\u25cf",
	wontdo: "\u2715",
};

const statusColors: Record<string, string> = {
	todo: "text.disabled",
	"in-progress": "warning.main",
	done: "success.main",
	wontdo: "error.main",
};

const typeBadgeColors: Record<string, { bg: string; text: string }> = {
	story: { bg: "info.light", text: "info.dark" },
	bug: { bg: "error.light", text: "error.dark" },
};

const cardSx: SxProps<Theme> = {
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
};

const idSx: SxProps<Theme> = { color: "text.disabled", flexShrink: 0 };
const nameSx: SxProps<Theme> = { fontWeight: 500, flex: 1, textAlign: "left" };

function chipSx(badge: { bg: string; text: string }): SxProps<Theme> {
	return {
		flexShrink: 0,
		bgcolor: badge.bg,
		color: badge.text,
		fontWeight: 500,
		fontSize: "0.75rem",
		height: 22,
	};
}

function iconSx(status: string): SxProps<Theme> {
	return { fontSize: "1.125rem", flexShrink: 0, color: statusColors[status] };
}

export function ItemCard({
	item,
	onSelect,
}: {
	item: BacklogItem;
	onSelect: () => void;
}) {
	return (
		<ButtonBase onClick={onSelect} sx={cardSx}>
			<Typography sx={iconSx(item.status)}>
				{statusIcons[item.status]}
			</Typography>
			<Chip
				label={item.type}
				size="small"
				sx={chipSx(typeBadgeColors[item.type])}
			/>
			<Typography variant="body2" sx={idSx}>
				#{item.id}
			</Typography>
			<Typography sx={nameSx}>{item.name}</Typography>
		</ButtonBase>
	);
}
