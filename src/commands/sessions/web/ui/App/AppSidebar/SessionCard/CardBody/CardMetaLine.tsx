import Box from "@mui/material/Box";
import { areChipsLoading } from "../areChipsLoading";
import { CardChips } from "./CardMetaLine/CardChips";
import { CardToggleCaptions } from "./CardMetaLine/CardToggleCaptions";
import { sessionToggles } from "../../../sessionToggles";
import type { SessionInfo } from "../../../../types";
import { useTopBarLayoutContext } from "../../../useTopBarLayoutContext";

const metaSx = {
	gridColumn: 2,
	gridRow: 2,
	display: "flex",
	alignItems: "center",
	gap: 0.625,
	minWidth: 0,
	overflow: "hidden",
	fontSize: "0.6875rem",
	lineHeight: "16px",
	color: "text.disabled",
} as const;

export function CardMetaLine({ session }: { session: SessionInfo }) {
	const topBar = useTopBarLayoutContext();

	if (areChipsLoading(session, false)) return null;

	return (
		<Box sx={metaSx}>
			<CardChips session={session} />
			{topBar && <CardToggleCaptions toggles={sessionToggles(session)} />}
		</Box>
	);
}
