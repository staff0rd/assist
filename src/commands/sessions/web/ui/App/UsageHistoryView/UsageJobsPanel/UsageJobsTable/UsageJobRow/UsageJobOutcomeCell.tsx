import Chip from "@mui/material/Chip";
import TableCell from "@mui/material/TableCell";
import { usageJobOutcomeChip } from "./usageJobOutcomeChip";

const chipSx = { height: 20, fontSize: "0.6875rem" } as const;

export function UsageJobOutcomeCell({ status }: { status: string }) {
	const outcome = usageJobOutcomeChip(status);
	return (
		<TableCell>
			<Chip
				label={outcome.label}
				size="small"
				variant="outlined"
				color={outcome.color}
				sx={chipSx}
			/>
		</TableCell>
	);
}
