import Box from "@mui/material/Box";
import { areChipsLoading } from "../areChipsLoading";
import { CardChips } from "./CardMetaLine/CardChips";
import { CardToggleCaptions } from "./CardMetaLine/CardToggleCaptions";
import { sessionToggles } from "../../../sessionToggles";
import type { SessionInfo } from "../../../../types";
import { TransferCaption } from "../../../../transfer/TransferCaption";
import { transferIndicator } from "../../../../transfer/transferIndicator";
import { sessionTextSize } from "../../../sessionTextSize";

const metaSx = {
	gridColumn: 2,
	gridRow: 2,
	display: "flex",
	alignItems: "center",
	gap: 0.625,
	minWidth: 0,
	overflow: "hidden",
	fontSize: sessionTextSize("0.6875rem"),
	lineHeight: "16px",
	color: "text.secondary",
} as const;

export function CardMetaLine({ session }: { session: SessionInfo }) {
	if (areChipsLoading(session, false)) return null;
	const transfer = transferIndicator(session);
	if (transfer)
		return (
			<Box sx={metaSx}>
				<TransferCaption {...transfer} />
			</Box>
		);

	return (
		<Box sx={metaSx}>
			<CardChips session={session} />
			<CardToggleCaptions toggles={sessionToggles(session)} />
		</Box>
	);
}
