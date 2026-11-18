import type { SessionInfo } from "../../../../types";
import { formatToolElapsed } from "./formatToolElapsed";
import { SDK_TAIL_SEPARATOR } from "./SdkTailDetail";
import { useTickingSeconds } from "./useTickingSeconds";

function activityText(session: SessionInfo): string | undefined {
	if (session.status !== "running") return undefined;
	if (session.sdkInterrupting) return "Stopping turn…";
	return session.sdkActivity ?? "Working";
}

function rowWorkflow(session: SessionInfo) {
	if (session.status !== "running" || session.sdkInterrupting) return undefined;
	return session.sdkActivity ? undefined : session.sdkWorkflow;
}

function secondsSince(at: number): number {
	return Math.floor((Date.now() - at) / 1000);
}

export function useActivityRow(session: SessionInfo) {
	const activity = activityText(session);
	const workflow = rowWorkflow(session);
	const elapsed = useTickingSeconds(
		workflow
			? secondsSince(workflow.startedAt)
			: activity && !session.sdkInterrupting
				? session.sdkActivityElapsed
				: undefined,
	);
	if (!activity) return undefined;
	return {
		text: workflow
			? `${activity}${SDK_TAIL_SEPARATOR}${workflow.command}`
			: activity,
		suffix: elapsed === undefined ? undefined : formatToolElapsed(elapsed),
	};
}
