import Box from "@mui/material/Box";
import { useState } from "react";
import { statusGlyph } from "../statusGlyph";
import type { SessionInfo } from "../types";
import { groupSessionsByStatus } from "./groupSessionsByStatus";
import { PhoneDoneTally } from "./PhoneDoneTally";
import { PhoneSessionRow } from "./PhoneSessionRow";
import { PhoneSessionSection } from "./PhoneSessionSection";

const emptySx = {
	p: 4,
	textAlign: "center",
	color: "text.secondary",
	fontSize: 15,
} as const;

export function PhoneSessionGroups({
	sessions,
	localNode,
}: {
	sessions: SessionInfo[];
	localNode: string | undefined;
}) {
	const [doneExpanded, setDoneExpanded] = useState(false);
	if (sessions.length === 0) return <Box sx={emptySx}>No sessions</Box>;

	const { needsYou, running, done } = groupSessionsByStatus(sessions);
	return (
		<>
			<PhoneSessionSection
				label={`${statusGlyph.waiting} Needs you`}
				sessions={needsYou}
				localNode={localNode}
				attention
			/>
			<PhoneSessionSection
				label="Running"
				sessions={running}
				localNode={localNode}
			/>
			{done.length > 0 && (
				<PhoneDoneTally
					count={done.length}
					expanded={doneExpanded}
					onToggle={() => setDoneExpanded((v) => !v)}
				/>
			)}
			{doneExpanded &&
				done.map((s) => (
					<PhoneSessionRow key={s.id} session={s} localNode={localNode} />
				))}
		</>
	);
}
