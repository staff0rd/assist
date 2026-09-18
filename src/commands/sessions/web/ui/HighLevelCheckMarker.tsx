import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Checkbox } from "@mui/material";
import type { HighLevelCheckResult } from "../../../review/highLevel/types";

export function HighLevelCheckMarker({
	check,
	ticked,
	onTick,
}: {
	check: HighLevelCheckResult;
	ticked: boolean;
	onTick: (ticked: boolean) => void;
}) {
	if (check.kind === "manual")
		return (
			<Checkbox
				size="small"
				checked={ticked}
				onChange={(e) => onTick(e.target.checked)}
				slotProps={{ input: { "aria-label": check.title } }}
				sx={{ p: 0.25 }}
			/>
		);
	return check.status === "fail" ? (
		<CancelIcon color="error" fontSize="small" titleAccess="fails" />
	) : (
		<CheckCircleIcon color="success" fontSize="small" titleAccess="passes" />
	);
}
