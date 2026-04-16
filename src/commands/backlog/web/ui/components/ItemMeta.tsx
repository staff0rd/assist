import { Chip, Stack, Typography } from "@mui/material";
import type { BacklogItem } from "../types";
import { StatusPicker } from "./StatusPicker";

const typeBadgeColors: Record<string, { bg: string; text: string }> = {
	story: { bg: "info.light", text: "info.dark" },
	bug: { bg: "error.light", text: "error.dark" },
};

const metaRowSx = {
	alignItems: "center",
	color: "text.disabled",
	fontSize: "0.875rem",
	mb: 2,
} as const;

export function ItemMeta({
	item,
	onStatusChange,
}: {
	item: BacklogItem;
	onStatusChange?: (status: BacklogItem["status"]) => void;
}) {
	const badge = typeBadgeColors[item.type];
	return (
		<Stack direction="row" spacing={1} sx={metaRowSx}>
			<Typography variant="body2" color="text.disabled">
				#{item.id}
			</Typography>
			{badge && <Chip label={item.type} size="small" sx={chipSx(badge)} />}
			<StatusPicker current={item.status} onStatusChange={onStatusChange} />
		</Stack>
	);
}

function chipSx(badge: { bg: string; text: string }) {
	return {
		bgcolor: badge.bg,
		color: badge.text,
		fontWeight: 500,
		fontSize: "0.75rem",
	} as const;
}
