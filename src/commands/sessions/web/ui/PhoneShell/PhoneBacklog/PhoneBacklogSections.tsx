import Box from "@mui/material/Box";
import { runInFlightSession } from "../../../../../backlog/web/ui/components/runInFlightSession";
import type { BacklogItemSummary } from "../../../../../backlog/web/ui/types";
import type { SessionInfo } from "../../types";
import { PhoneSectionHeader } from "../PhoneSectionHeader";
import { groupBacklogItems } from "./groupBacklogItems";
import { PhoneBacklogRow } from "./PhoneBacklogRow";
import { phoneEmptySx } from "../phoneEmptySx";
import { usePhoneBacklogItems } from "./usePhoneBacklogItems";

type Props = {
	cwd: string;
	query: string;
	sessions: SessionInfo[];
};

function Section({
	label,
	items,
	cwd,
	sessions,
}: {
	label: string;
	items: BacklogItemSummary[];
	cwd: string;
	sessions: SessionInfo[];
}) {
	if (items.length === 0) return null;
	return (
		<>
			<PhoneSectionHeader label={label} count={items.length} />
			{items.map((item) => (
				<PhoneBacklogRow
					key={item.id}
					item={item}
					cwd={cwd}
					running={!!runInFlightSession(sessions, item.id)}
				/>
			))}
		</>
	);
}

export function PhoneBacklogSections({ cwd, query, sessions }: Props) {
	const { items, loading, error } = usePhoneBacklogItems(cwd);
	if (loading) return <Box sx={phoneEmptySx}>Loading…</Box>;
	if (error && items.length === 0) return <Box sx={phoneEmptySx}>{error}</Box>;

	const { inProgress, todo } = groupBacklogItems(items, query);
	if (inProgress.length + todo.length === 0)
		return (
			<Box sx={phoneEmptySx}>
				{query ? "No matching items" : "No open items"}
			</Box>
		);
	return (
		<>
			<Section
				label="In progress"
				items={inProgress}
				cwd={cwd}
				sessions={sessions}
			/>
			<Section label="Todo" items={todo} cwd={cwd} sessions={sessions} />
		</>
	);
}
