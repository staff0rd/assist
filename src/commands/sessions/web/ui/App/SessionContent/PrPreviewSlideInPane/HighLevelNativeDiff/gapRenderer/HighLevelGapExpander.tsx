import { Box } from "@mui/material";
import { Decoration } from "react-diff-view";
import type { Gap, GapDirection } from "../gapAt";
import { GapButtons } from "./HighLevelGapExpander/GapButtons";
import { GapStatus } from "./HighLevelGapExpander/GapStatus";

export function HighLevelGapExpander({
	gap,
	header,
	elsewhere,
	disabled,
	loading,
	error,
	onExpand,
	onRetry,
}: {
	gap: Gap;
	header: string | undefined;
	elsewhere?: string | undefined;
	disabled: boolean;
	loading: boolean;
	error: string | undefined;
	onExpand: (direction: GapDirection) => void;
	onRetry: () => void;
}) {
	return (
		<Decoration
			className="high-level-gap"
			gutterClassName="high-level-gap-gutter"
			contentClassName="high-level-gap-content"
		>
			<Box className="high-level-gap-buttons">
				<GapButtons gap={gap} disabled={disabled} onExpand={onExpand} />
			</Box>
			<GapStatus
				hidden={gap.end === null ? null : gap.end - gap.start}
				header={header}
				elsewhere={elsewhere}
				loading={loading}
				error={error}
				onRetry={onRetry}
			/>
		</Decoration>
	);
}
