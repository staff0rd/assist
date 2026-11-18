import Box from "@mui/material/Box";
import { statusPillSx } from "../../designSystem/statusPillSx";
import type { SessionInfo } from "../../types";
import { CardBacklogChips } from "./CardBacklogChips";
import { CardRepo } from "./CardRepo";
import { CardClose } from "./CardClose";
import { cardTextSx } from "./cardTextSx";
import type { needsYouChip } from "./needsYouChip";

export function NeedsYouCardHead({
	session,
	chip,
}: {
	session: SessionInfo;
	chip: ReturnType<typeof needsYouChip>;
}) {
	return (
		<Box sx={cardTextSx.head}>
			<Box
				component="span"
				sx={[
					statusPillSx(`${chip.color}.main`),
					{ typography: "caption", fontWeight: 600, py: 0.25 },
				]}
			>
				{chip.label}
			</Box>
			<CardBacklogChips session={session} />
			<CardRepo session={session} />
			<CardClose session={session} />
		</Box>
	);
}
