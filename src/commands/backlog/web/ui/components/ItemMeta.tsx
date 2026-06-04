import { Chip, Stack, Typography } from "@mui/material";
import type { BacklogItem } from "../types";
import { StatusPicker } from "./StatusPicker";
import { typeChipColors } from "./typeChipColors";

const metaRowSx = {
	alignItems: "center",
	color: "text.disabled",
	fontSize: "0.875rem",
	mb: 2,
} as const;

const chipSx = {
	fontWeight: 500,
	fontSize: "0.75rem",
} as const;

export function ItemMeta({
	item,
	onStatusChange,
}: {
	item: BacklogItem;
	onStatusChange?: (status: BacklogItem["status"]) => void;
}) {
	const color = typeChipColors[item.type];
	return (
		<Stack direction="row" spacing={1} sx={metaRowSx}>
			<Typography variant="body2" color="text.disabled">
				#{item.id}
			</Typography>
			{color && (
				<Chip label={item.type} size="small" color={color} sx={chipSx} />
			)}
			<StatusPicker current={item.status} onStatusChange={onStatusChange} />
		</Stack>
	);
}
