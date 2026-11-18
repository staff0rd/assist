import MenuItem from "@mui/material/MenuItem";
import type { MouseEvent, ReactNode } from "react";
import { HarnessColumns } from "./HarnessColumns";
import { reviewAlternateSx } from "./reviewAlternateSx";
import { ReviewMenuLabel } from "./ReviewMenuLabel";
import type { ReviewModeEntry } from "./reviewModeEntries";
import { reviewRowKeyDown } from "./reviewRowKeyDown";

export function ReviewMenuRow({
	entry,
	caption,
	icon,
	disabled,
	onSelect,
}: {
	entry: ReviewModeEntry;
	caption?: string | undefined;
	icon?: ReactNode;
	disabled?: boolean | undefined;
	onSelect: (e: MouseEvent, args: string[]) => void;
}) {
	const hasButtons = entry.columns.length > 0;
	return (
		<MenuItem
			sx={
				hasButtons ? reviewAlternateSx.rowWithAlternates : reviewAlternateSx.row
			}
			disabled={disabled}
			onClick={(e) => onSelect(e, entry.args)}
			onKeyDown={reviewRowKeyDown}
		>
			{icon}
			<ReviewMenuLabel label={entry.label} caption={caption} />
			{hasButtons && (
				<HarnessColumns
					label={entry.label}
					columns={entry.columns}
					alternates={entry.alternates}
					onSelect={onSelect}
				/>
			)}
		</MenuItem>
	);
}
