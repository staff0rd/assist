import Box from "@mui/material/Box";
import { statusColors } from "../App/statusColors";
import { useNowSeconds } from "../App/useNowSeconds";
import { statusPillSx } from "../designSystem/statusPillSx";
import { displayStatus } from "../displayStatus";
import { statusGlyph } from "../statusGlyph";
import type { SessionInfo } from "../types";
import { PhoneBadges } from "./PhoneBadges";
import { PhoneStripOrigin } from "./PhoneStripOrigin";
import { phaseLabel } from "./phaseLabel";

const stripSx = {
	flex: "none",
	display: "flex",
	alignItems: "center",
	flexWrap: "wrap",
	gap: 1,
	px: 2,
	pt: 0.75,
	pb: 1,
	borderBottom: 1,
	borderColor: "divider",
	fontSize: 13,
	color: "text.secondary",
} as const;

const elapsedSx = {
	ml: "auto",
	fontFamily: "fontFamilyMono",
	fontSize: 12,
} as const;

function elapsed(startedAt: number, nowSeconds: number): string {
	const mins = Math.max(0, Math.floor((nowSeconds * 1000 - startedAt) / 60000));
	return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h`;
}

export function PhoneStatusStrip({
	session,
	localNode,
}: {
	session: SessionInfo;
	localNode: string | undefined;
}) {
	const now = useNowSeconds(30_000);
	const status = displayStatus(session);
	const phase = phaseLabel(session);
	return (
		<Box sx={stripSx}>
			<Box
				component="span"
				sx={[statusPillSx(statusColors[status]), { fontSize: 12 }]}
			>
				{statusGlyph[status]} {status[0].toUpperCase() + status.slice(1)}
			</Box>
			<PhoneStripOrigin session={session} localNode={localNode} />
			<PhoneBadges session={session} localNode={localNode} hideNode />
			{phase && <span>phase {phase}</span>}
			<Box component="span" sx={elapsedSx}>
				{elapsed(session.startedAt, now)}
			</Box>
		</Box>
	);
}
