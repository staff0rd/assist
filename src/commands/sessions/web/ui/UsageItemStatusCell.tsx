import Chip from "@mui/material/Chip";
import TableCell from "@mui/material/TableCell";
import { usageItemStatusChip } from "./usageItemStatusChip";

const chipSx = { height: 20, fontSize: "0.6875rem" } as const;

export function UsageItemStatusCell({ status }: { status: string }) {
	const chip = usageItemStatusChip(status);
	return (
		<TableCell>
			<Chip
				label={chip.label}
				size="small"
				variant="outlined"
				color={chip.color}
				sx={chipSx}
			/>
		</TableCell>
	);
}
