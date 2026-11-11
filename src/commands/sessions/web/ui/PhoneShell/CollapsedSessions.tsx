import { useState } from "react";
import type { SessionInfo } from "../types";
import { PhoneSessionRow } from "./PhoneSessionRow";
import { PhoneTallyRow } from "./PhoneTallyRow";

export function CollapsedSessions({
	sessions,
	localNode,
	defaultExpanded = false,
	...tally
}: {
	sessions: SessionInfo[];
	localNode: string | undefined;
	label: string;
	glyph: string;
	glyphColor: string;
	needsYou?: number;
	defaultExpanded?: boolean;
}) {
	const [expanded, setExpanded] = useState(defaultExpanded);
	if (sessions.length === 0) return null;
	return (
		<>
			<PhoneTallyRow
				{...tally}
				count={sessions.length}
				expanded={expanded}
				onToggle={() => setExpanded((v) => !v)}
			/>
			{expanded &&
				sessions.map((s) => (
					<PhoneSessionRow key={s.id} session={s} localNode={localNode} />
				))}
		</>
	);
}
