import Chip from "@mui/material/Chip";
import TableCell from "@mui/material/TableCell";
import { statusChipColors } from "../../../backlog/web/ui/components/typeChipColors";

const chipSx = { height: 20, fontSize: "0.6875rem" } as const;

export function UsageItemStatusCell({ status }: { status: string }) {
	return (
		<TableCell>
			<Chip
				label={status}
				size="small"
				variant="outlined"
				color={statusChipColors[status]}
				sx={chipSx}
			/>
		</TableCell>
	);
}
