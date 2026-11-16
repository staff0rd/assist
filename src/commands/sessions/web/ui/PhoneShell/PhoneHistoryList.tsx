import Box from "@mui/material/Box";
import { phoneScrollAttr } from "./PhoneNavStack/phoneScrollAttr";
import { useEffect } from "react";
import { repoLabel } from "../App/repoLabel";
import type { HistoricalSession } from "../types";
import { PhoneHistoryRow } from "./PhoneHistoryRow";
import { PhoneNavBar } from "./PhoneNavBar";
import { PhoneRepoChips } from "./PhoneRepoChips";
import { PhoneRepoEmpty } from "./PhoneRepoChips/PhoneRepoEmpty";
import { useRepoFilter } from "./PhoneRepoChips/useRepoFilter";

const bodySx = {
	flex: 1,
	minHeight: 0,
	overflowY: "auto",
} as const;

type Props = {
	history: HistoricalSession[];
	localNode: string | undefined;
	requestHistory: () => void;
};

export function PhoneHistoryList({
	history,
	localNode,
	requestHistory,
}: Props) {
	useEffect(() => requestHistory(), [requestHistory]);
	const { repo, selectRepo, chips, shown } = useRepoFilter(history);

	return (
		<>
			<PhoneNavBar title="History" />
			<PhoneRepoChips
				chips={chips}
				total={history.length}
				selected={repo}
				onSelect={selectRepo}
			/>
			<Box sx={bodySx} {...phoneScrollAttr}>
				{repo !== null && shown.length === 0 && (
					<PhoneRepoEmpty
						message={`No history in ${repoLabel(repo)}`}
						onShowAll={() => selectRepo(null)}
					/>
				)}
				{shown.map((h) => (
					<PhoneHistoryRow
						key={`${h.node ?? ""}:${h.sessionId}`}
						entry={h}
						localNode={localNode}
						hideRepo={repo !== null}
					/>
				))}
			</Box>
		</>
	);
}
