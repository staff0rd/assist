import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import type { Theme } from "@mui/material/styles";
import { harnessLabel } from "../../../../../../shared/harnessLabel";
import type { ReviewModeEntry } from "../../App/reviewModeEntries";
import { touchTarget } from "../../designSystem/touchTarget";
import { PhoneSheetItem } from "./PhoneSheetItem";

const rowSx = { display: "flex", alignItems: "stretch" } as const;
const mainSx = { flex: 1, minWidth: 0 } as const;
const alternateSx = {
	flex: "none",
	minWidth: touchTarget,
	px: 1.5,
	borderLeft: 1,
	borderColor: (t: Theme) => t.tokens.color.lineSoft,
	fontSize: 14,
	fontWeight: 600,
	color: "primary.main",
} as const;

export function PhonePrModeRow({
	entry,
	onLaunch,
}: {
	entry: ReviewModeEntry;
	onLaunch: (args: string[]) => void;
}) {
	return (
		<Box sx={rowSx}>
			<Box sx={mainSx}>
				<PhoneSheetItem
					label={entry.label}
					icon={<RateReviewOutlinedIcon fontSize="small" />}
					onClick={() => onLaunch(entry.args)}
				/>
			</Box>
			{entry.alternates.map(({ harness, args }) => (
				<ButtonBase
					key={harness}
					aria-label={`Run ${entry.label} on ${harnessLabel(harness)}`}
					sx={alternateSx}
					onClick={() => onLaunch(args)}
				>
					{harnessLabel(harness)}
				</ButtonBase>
			))}
		</Box>
	);
}
