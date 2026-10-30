import type { SessionInfo } from "../types";
import { PhoneSectionHeader } from "./PhoneSectionHeader";
import { PhoneSessionRow } from "./PhoneSessionRow";

export function PhoneSessionSection({
	label,
	sessions,
	localNode,
	attention,
}: {
	label: string;
	sessions: SessionInfo[];
	localNode: string | undefined;
	attention?: boolean;
}) {
	if (sessions.length === 0) return null;
	return (
		<>
			<PhoneSectionHeader
				label={label}
				count={sessions.length}
				attention={attention}
			/>
			{sessions.map((s) => (
				<PhoneSessionRow
					key={s.id}
					session={s}
					localNode={localNode}
					showMessage={attention}
				/>
			))}
		</>
	);
}
