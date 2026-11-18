import Box from "@mui/material/Box";
import { statusPillSx } from "../../designSystem/statusPillSx";
import type { SessionInfo } from "../../types";
import { awaitingSince } from "./awaitingSince";
import { cardTextSx } from "./cardTextSx";
import { formatAge } from "./formatAge";
import type { needsYouChip } from "./needsYouChip";

export function NeedsYouCardHead({
	session,
	chip,
	nowMs,
}: {
	session: SessionInfo;
	chip: ReturnType<typeof needsYouChip>;
	nowMs: number;
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
			<Box component="span" sx={cardTextSx.age}>
				{formatAge(awaitingSince(session), nowMs)}
			</Box>
		</Box>
	);
}
