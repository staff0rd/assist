import { Box, Chip, type ChipProps, Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { PhaseStatus } from "../types";
import { type PhaseHeaderProps, PhaseRewind } from "./PhaseRewind";
import { sessionTextSize } from "../../../../sessions/web/ui/App/sessionTextSize";

const slateStatusBadge: Record<
	PhaseStatus,
	{ label: string; color: ChipProps["color"] }
> = {
	done: { label: "Done", color: "success" },
	current: { label: "In progress", color: "primary" },
	upcoming: { label: "To do", color: "default" },
};

const slateHeaderSx = {
	alignItems: "center",
	flexWrap: "wrap",
	gap: 1,
	fontSize: sessionTextSize(14),
	fontWeight: 600,
} as const;

const numberSx = (t: Theme) => ({
	fontFamily: t.typography.fontFamilyMono,
	fontSize: sessionTextSize(12),
	fontWeight: 500,
	color: "text.disabled",
});

export function SlatePhaseHeader(props: PhaseHeaderProps) {
	const badge = slateStatusBadge[props.status];
	return (
		<Stack direction="row" sx={slateHeaderSx}>
			<Box component="span" sx={numberSx}>
				{props.index + 1}
			</Box>
			<span>{props.phase.name}</span>
			<Chip label={badge.label} size="small" color={badge.color} />
			<PhaseRewind {...props} />
		</Stack>
	);
}
