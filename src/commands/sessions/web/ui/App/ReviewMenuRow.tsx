import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import MenuItem from "@mui/material/MenuItem";
import type { MouseEvent } from "react";
import { harnessLabel } from "../../../../../shared/harnessAdapters/harnessLabel";
import { reviewAlternateSx } from "./reviewAlternateSx";
import type { ReviewModeEntry } from "./reviewModeEntries";
import { reviewRowKeyDown } from "./reviewRowKeyDown";

export function ReviewMenuRow({
	entry,
	onSelect,
}: {
	entry: ReviewModeEntry;
	onSelect: (e: MouseEvent, args: string[]) => void;
}) {
	return (
		<MenuItem
			sx={
				entry.alternates.length > 0
					? reviewAlternateSx.rowWithAlternates
					: reviewAlternateSx.row
			}
			onClick={(e) => onSelect(e, entry.args)}
			onKeyDown={reviewRowKeyDown}
		>
			<Box component="span" sx={reviewAlternateSx.label}>
				{entry.label}
			</Box>
			{entry.alternates.length > 0 && (
				<Box component="span" sx={reviewAlternateSx.group}>
					{entry.alternates.map(({ harness, args }) => (
						<ButtonBase
							key={harness}
							tabIndex={-1}
							aria-label={`Run ${entry.label} on ${harnessLabel(harness)}`}
							title={`Run on ${harnessLabel(harness)}`}
							sx={reviewAlternateSx.button}
							onClick={(e) => {
								e.stopPropagation();
								onSelect(e, args);
							}}
						>
							{harnessLabel(harness)}
						</ButtonBase>
					))}
				</Box>
			)}
		</MenuItem>
	);
}
