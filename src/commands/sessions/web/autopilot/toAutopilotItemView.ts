import type { BacklogComment, BacklogItem } from "../../../backlog/types";
import type { AutopilotStatus } from "../../daemon/autopilot/AutopilotStatus";
import type { AutopilotItemView } from "./AutopilotItemView";
import type { DiffStat } from "./commitDiffStat";
import { itemPhaseProgress } from "./itemPhaseProgress";

type RecordedItem = AutopilotStatus["items"][number];

function latest(
	comments: BacklogComment[],
	type: BacklogComment["type"],
): BacklogComment | undefined {
	return comments.filter((comment) => comment.type === type).at(-1);
}

export function toAutopilotItemView(
	item: BacklogItem,
	recorded: RecordedItem,
	diff: DiffStat,
): AutopilotItemView {
	const comments = item.comments ?? [];
	const delivered = latest(comments, "delivered");
	const finished =
		item.status === "done" || item.status === "wontdo"
			? (delivered ?? latest(comments, "summary"))
			: undefined;
	return {
		id: item.id,
		name: item.name,
		status: item.status,
		sessionId: recorded.sessionId,
		startedAt: recorded.startedAt,
		why: latest(comments, "why")?.text,
		delivered: delivered?.text,
		result: latest(comments, "result")?.text,
		summary: latest(comments, "summary")?.text,
		finishedAt: finished?.timestamp,
		...itemPhaseProgress(item),
		commits: (item.gitRefs ?? []).filter((ref) => ref.kind === "commit").length,
		...diff,
	};
}
