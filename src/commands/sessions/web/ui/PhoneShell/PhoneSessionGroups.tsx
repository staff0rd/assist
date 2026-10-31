import Box from "@mui/material/Box";
import { useState } from "react";
import { statusGlyph } from "../statusGlyph";
import type { SessionInfo } from "../types";
import { groupSessionsByStatus } from "./groupSessionsByStatus";
import { PhoneDoneTally } from "./PhoneDoneTally";
import { phoneEmptySx } from "./phoneEmptySx";
import { PhoneSessionRow } from "./PhoneSessionRow";
import { PhoneSessionSection } from "./PhoneSessionSection";

export function PhoneSessionGroups({
	sessions,
	localNode,
}: {
	sessions: SessionInfo[];
	localNode: string | undefined;
}) {
	const [doneExpanded, setDoneExpanded] = useState(false);
	if (sessions.length === 0) return <Box sx={phoneEmptySx}>No sessions</Box>;

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
