import type { PrSummary } from "../prList";
import type { AssistLaunchMeta } from "./createSessionAction";
import { formatRelativeTime } from "./formatRelativeTime";

export function prLaunchMeta(pr: PrSummary): AssistLaunchMeta {
	return {
		title: pr.title,
		subtitle: `#${pr.number} · ${pr.author} · ${formatRelativeTime(
			pr.createdAt,
		)}`,
	};
}
