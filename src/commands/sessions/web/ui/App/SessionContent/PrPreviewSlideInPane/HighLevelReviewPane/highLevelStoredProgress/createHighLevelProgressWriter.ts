import { apiFetch } from "../../../../../apiFetch";
import { reportCaughtError } from "../../../../../clientFailures/reportCaughtError";
import { withNode } from "../../../../../withNode";
import { highLevelProgressApiPath } from "../../../../../../../../review/highLevel/progressStore/highLevelProgressApiPath";
import type {
	HighLevelPaneProgress,
	HighLevelProgressHead,
} from "../../../../../../../../review/highLevel/progressStore/StoredHighLevelProgress";

export function createHighLevelProgressWriter(
	head: HighLevelProgressHead,
	node: string | undefined,
) {
	let latest: HighLevelPaneProgress | undefined;
	let running: Promise<void> | undefined;
	let closed = false;

	const send = (progress: HighLevelPaneProgress) =>
		apiFetch(withNode(highLevelProgressApiPath, node), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...head, ...progress }),
		}).catch((error: unknown) =>
			reportCaughtError(error, "high-level progress write"),
		);

	const drain = async () => {
		while (latest) {
			const next = latest;
			latest = undefined;
			await send(next);
		}
		running = undefined;
	};

	return {
		write(progress: HighLevelPaneProgress) {
			if (closed) return;
			latest = progress;
			running ??= drain();
		},
		close() {
			closed = true;
		},
	};
}
