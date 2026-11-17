import Box from "@mui/material/Box";
import type { MouseEvent } from "react";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { HarnessButton } from "./HarnessButton";
import { HarnessSlot } from "./HarnessSlot";
import { reviewAlternateSx } from "./reviewAlternateSx";
import type { ReviewModeEntry } from "./reviewModeEntries";

export function HarnessColumns({
	label,
	columns,
	alternates,
	onSelect,
}: {
	label: string;
	columns: HarnessKind[];
	alternates: ReviewModeEntry["alternates"];
	onSelect: (e: MouseEvent, args: string[]) => void;
}) {
	const byHarness = new Map(alternates.map((a) => [a.harness, a]));
	return (
		<Box component="span" sx={reviewAlternateSx.group}>
			{columns.map((harness) => {
				const alternate = byHarness.get(harness);
				return alternate ? (
					<HarnessButton
						key={harness}
						label={label}
						harness={harness}
						onClick={(e) => onSelect(e, alternate.args)}
					/>
				) : (
					<HarnessSlot key={harness} harness={harness} />
				);
			})}
		</Box>
	);
}
