import Box from "@mui/material/Box";
import { useEffect } from "react";
import type { HistoricalSession } from "../types";
import { PhoneHistoryRow } from "./PhoneHistoryRow";
import { PhoneNavBar } from "./PhoneNavBar";

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

	return (
		<>
			<PhoneNavBar title="History" />
			<Box sx={bodySx}>
				{history.map((h) => (
					<PhoneHistoryRow
						key={`${h.node ?? ""}:${h.sessionId}`}
						entry={h}
						localNode={localNode}
					/>
				))}
			</Box>
		</>
	);
}
