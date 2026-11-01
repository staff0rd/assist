import type { SessionInfo } from "../types";
import {
	PhoneSectionHeader,
	type PhoneSectionTone,
} from "./PhoneSectionHeader";
import { PhoneSessionRow } from "./PhoneSessionRow";

export function PhoneSessionSection({
	label,
	sessions,
	localNode,
	tone,
}: {
	label: string;
	sessions: SessionInfo[];
	localNode: string | undefined;
	tone?: PhoneSectionTone;
}) {
	if (sessions.length === 0) return null;
	return (
		<>
			<PhoneSectionHeader label={label} count={sessions.length} tone={tone} />
			{sessions.map((s) => (
				<PhoneSessionRow
					key={s.id}
					session={s}
					localNode={localNode}
					showMessage={tone !== undefined}
				/>
			))}
		</>
	);
}
