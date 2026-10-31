import Box from "@mui/material/Box";
import { useRef } from "react";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import { useHomeNodeContext } from "../HomeNodeGate/useHomeNodeContext";
import type { SessionInfo } from "../types";
import { PhoneListNavActions } from "./PhoneListNavActions";
import { PhoneNavBar } from "./PhoneNavBar";
import { PhoneNodeChip } from "./PhoneNodeChip";
import { PhoneSessionGroups } from "./PhoneSessionGroups";
import { PhoneVersionBanner } from "./PhoneVersionBanner";
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
	onOpenNodes?: () => void;
	onOpenHomeUpdate?: () => void;
	onNewSession?: () => void;
};

export function PhoneSessionList({
	sessions,
	localNode,
	reconnecting,
	onRefresh,
	onOpenNodes,
	onOpenHomeUpdate,
	onNewSession,
}: Props) {
	const bodyRef = useRef<HTMLDivElement | null>(null);
	const { pull, refreshing } = usePullToRefresh(bodyRef, onRefresh);
	const homeName = useHomeNodeContext()?.home?.name;

	return (
		<>
			<PhoneNavBar
				left={
					<PhoneNodeChip
						name={homeName ?? localNode}
						tone={reconnecting ? "warn" : "ok"}
						onClick={onOpenNodes}
					/>
				}
				title="Sessions"
				right={<PhoneListNavActions onNewSession={onNewSession} />}
			/>
			<PhoneVersionBanner onOpen={onOpenHomeUpdate} />
			<Box ref={bodyRef} sx={bodySx}>
				<PullIndicator pull={pull} refreshing={refreshing} />
				<PhoneSessionGroups sessions={sessions} localNode={localNode} />
			</Box>
		</>
	);
}
