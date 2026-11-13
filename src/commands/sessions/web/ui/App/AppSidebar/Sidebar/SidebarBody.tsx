import { HistoryList } from "./SidebarBody/HistoryList";
import { SessionList } from "./SidebarBody/SessionList";
import type { SidebarProps } from "../../../types";

export function SidebarBody(props: SidebarProps) {
	if (props.tab !== "active")
		return (
			<HistoryList
				sessions={props.history}
				viewingId={props.viewingId}
				onView={props.onView}
				onResume={props.onResume}
			/>
		);

	return (
		<SessionList
			sessions={props.sessions}
			pendingLaunches={props.pendingLaunches}
			activeId={props.activeId}
			initialized={props.initialized}
			onSelect={props.onSelect}
			onDismissPending={props.onDismissPending}
			onRetry={props.onRetry}
			onRestart={props.onRestart}
			onStartOver={props.onStartOver}
			onDismiss={props.onDismiss}
			onSetAutoApprove={props.onSetAutoApprove}
			onSetAutoAdvance={props.onSetAutoAdvance}
		/>
	);
}
