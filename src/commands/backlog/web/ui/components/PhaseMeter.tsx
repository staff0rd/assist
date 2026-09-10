import { Box } from "@mui/material";
import type { BacklogItemSummary } from "../types";
import {
	phaseMeterSegments,
	type PhaseSegmentKind,
} from "./phaseMeterSegments";

const segmentColors: Record<PhaseSegmentKind, string> = {
	done: "text.secondary",
	current: "warning.main",
	remaining: "divider",
	complete: "success.main",
};

const meterSx = {
	display: "inline-flex",
	alignItems: "center",
	gap: 0.5,
	flexShrink: 0,
};

const labelSx = {
	fontSize: "0.6875rem",
	color: "text.secondary",
	fontVariantNumeric: "tabular-nums",
};

const trackSx = { display: "inline-flex", alignItems: "center", gap: "2px" };

const segmentSx = {
	width: 6,
	height: 12,
	borderRadius: "1px",
	flexShrink: 0,
};

export function PhaseMeter({ item }: { item: BacklogItemSummary }) {
	const meter = phaseMeterSegments(item);
	if (!meter) return null;
	return (
		<Box sx={meterSx} title={`Phase ${meter.reached} of ${meter.total}`}>
			<Box component="span" sx={labelSx}>
				{`${meter.reached}/${meter.total}`}
			</Box>
			<Box component="span" sx={trackSx} aria-hidden>
				{meter.segments.map((segment) => (
					<Box
						key={segment.phase}
						component="span"
						data-segment={segment.kind}
						sx={{ ...segmentSx, bgcolor: segmentColors[segment.kind] }}
					/>
				))}
			</Box>
		</Box>
	);
}
