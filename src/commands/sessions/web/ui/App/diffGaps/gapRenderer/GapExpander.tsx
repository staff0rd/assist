import { Box } from "@mui/material";
import { Decoration } from "react-diff-view";
import type { Gap, GapDirection } from "../gapAt";
import { GapButtons } from "./GapExpander/GapButtons";
import { GapStatus } from "./GapExpander/GapStatus";

export function GapExpander({
	gap,
	header,
	from,
	elsewhere,
	disabled,
	loading,
	error,
	onExpand,
	onRetry,
}: {
	gap: Gap;
	header: string | undefined;
	from: string | undefined;
	elsewhere?: string | undefined;
	disabled: boolean;
	loading: boolean;
	error: string | undefined;
	onExpand: (direction: GapDirection) => void;
	onRetry: () => void;
}) {
	return (
		<Decoration
			className="diff-gap"
			gutterClassName="diff-gap-gutter"
			contentClassName="diff-gap-content"
		>
			<Box className="diff-gap-buttons">
				<GapButtons gap={gap} disabled={disabled} onExpand={onExpand} />
			</Box>
			<GapStatus
				hidden={gap.end === null ? null : gap.end - gap.start}
				header={header}
				from={from}
				elsewhere={elsewhere}
				loading={loading}
				error={error}
				onRetry={onRetry}
			/>
		</Decoration>
	);
}
