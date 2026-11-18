import Box from "@mui/material/Box";
import { statusPillSx } from "../../designSystem/statusPillSx";
import { sessionTitle } from "../sessionTitle";
import type { SessionInfo } from "../../types";
import { askedText } from "./askedText";
import { awaitingSince } from "./awaitingSince";
import {
	boardCardSx,
	cardAgeSx,
	cardHeadSx,
	cardTitleSx,
	clampSx,
} from "./boardCardSx";
import { formatAge } from "./formatAge";
import { needsYouChip } from "./needsYouChip";

export function NeedsYouCard({
	session,
	nowMs,
}: {
	session: SessionInfo;
	nowMs: number;
}) {
	const chip = needsYouChip(session);
	return (
		<Box sx={boardCardSx(chip.color)} data-testid="needs-you-card">
			<Box sx={cardHeadSx}>
				<Box component="span" sx={statusPillSx(`${chip.color}.main`)}>
					{chip.label}
				</Box>
				<Box component="span" sx={cardAgeSx}>
					{formatAge(awaitingSince(session), nowMs)}
				</Box>
			</Box>
			<Box sx={[cardTitleSx, clampSx(2)]}>{sessionTitle(session)}</Box>
			<Box
				sx={[
					{ typography: "body2", color: "text.primary", opacity: 0.85 },
					clampSx(4),
				]}
			>
				{askedText(session)}
			</Box>
		</Box>
	);
}
