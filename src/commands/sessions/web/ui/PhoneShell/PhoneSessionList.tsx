import HistoryIcon from "@mui/icons-material/History";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useRef } from "react";
import { useNavigate } from "react-router";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import type { SessionInfo } from "../types";
import { PhoneNavBar } from "./PhoneNavBar";
import { PhoneNodeChip } from "./PhoneNodeChip";
import { PhoneSessionGroups } from "./PhoneSessionGroups";
import { PullIndicator } from "./PullIndicator";
import { usePullToRefresh } from "./usePullToRefresh";

const bodySx = {
	flex: 1,
	minHeight: 0,
	overflowY: "auto",
	WebkitOverflowScrolling: "touch",
	pb: safeAreaInsets.bottom,
} as const;

type Props = {
	sessions: SessionInfo[];
	localNode: string | undefined;
	reconnecting: boolean;
	onRefresh: () => void;
};

export function PhoneSessionList({
	sessions,
	localNode,
	reconnecting,
	onRefresh,
}: Props) {
	const navigate = useNavigate();
	const bodyRef = useRef<HTMLDivElement | null>(null);
	const { pull, refreshing } = usePullToRefresh(bodyRef, onRefresh);

	return (
		<>
			<PhoneNavBar
				left={<PhoneNodeChip name={localNode} reconnecting={reconnecting} />}
				title="Sessions"
				right={
					<IconButton
						aria-label="History"
						sx={{ color: "primary.main" }}
						onClick={() => navigate("/history")}
					>
						<HistoryIcon />
					</IconButton>
				}
			/>
			<Box ref={bodyRef} sx={bodySx}>
				<PullIndicator pull={pull} refreshing={refreshing} />
				<PhoneSessionGroups sessions={sessions} localNode={localNode} />
			</Box>
		</>
	);
}
