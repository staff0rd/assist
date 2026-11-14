import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Chip } from "@mui/material";
import type { HighLevelCheckResult } from "../../../../../../../../review/highLevel/types";
import { DESCRIPTION_CHECK_LABELS } from "../highLevelDescriptionChecks";

const chipSx = {
	height: "auto",
	py: 0.25,
	"& .MuiChip-label": { whiteSpace: "normal" },
} as const;

export function HighLevelDescriptionChips({
	checks,
}: {
	checks: HighLevelCheckResult[];
}) {
	if (checks.length === 0) return null;
	return (
		<Box
			role="list"
			aria-label="Description checks"
			sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
		>
			{checks.map((check) => {
				const pass = check.status === "pass";
				const Icon = pass ? CheckCircleIcon : CancelIcon;
				return (
					<Chip
						key={check.id}
						role="listitem"
						size="small"
						variant="tonal"
						color={pass ? "default" : "error"}
						icon={
							<Icon
								titleAccess={pass ? "pass" : "fail"}
								color={pass ? "success" : "error"}
							/>
						}
						label={`${DESCRIPTION_CHECK_LABELS[check.id]}: ${check.reason}`}
						sx={chipSx}
					/>
				);
			})}
		</Box>
	);
}
