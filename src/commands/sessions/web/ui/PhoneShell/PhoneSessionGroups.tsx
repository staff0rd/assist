import Box from "@mui/material/Box";
import { statusColors } from "../App/statusColors";
import { statusGlyph } from "../statusGlyph";
import type { SessionInfo } from "../types";
import { groupSessionsByStatus, needsAttention } from "./groupSessionsByStatus";
import { phoneEmptySx } from "./phoneEmptySx";
import { PhoneSessionSection } from "./PhoneSessionSection";
import { CollapsedSessions } from "./CollapsedSessions";

export function PhoneSessionGroups({
	sessions,
	localNode,
	hideRepo,
}: {
	sessions: SessionInfo[];
	localNode: string | undefined;
	hideRepo?: boolean;
}) {
	if (sessions.length === 0) return <Box sx={phoneEmptySx}>No sessions</Box>;

	const { questions, needsYou, running, review, done } =
		groupSessionsByStatus(sessions);
	return (
		<>
			<PhoneSessionSection
				label={`${statusGlyph.question} Answer here`}
				sessions={questions}
				localNode={localNode}
				hideRepo={hideRepo}
				tone="accent"
			/>
			<PhoneSessionSection
				label={`${statusGlyph.waiting} Needs you`}
				sessions={needsYou}
				localNode={localNode}
				hideRepo={hideRepo}
				tone="warning"
			/>
			<PhoneSessionSection
				label="Running"
				sessions={running}
				localNode={localNode}
				hideRepo={hideRepo}
			/>
			<CollapsedSessions
				label="Review"
				glyph="◇"
				glyphColor="primary.main"
				sessions={review}
				needsYou={review.filter(needsAttention).length}
				localNode={localNode}
				hideRepo={hideRepo}
				defaultExpanded
			/>
			<CollapsedSessions
				label="Done"
				glyph={statusGlyph.done}
				glyphColor={statusColors.done}
				sessions={done}
				localNode={localNode}
				hideRepo={hideRepo}
			/>
		</>
	);
}
