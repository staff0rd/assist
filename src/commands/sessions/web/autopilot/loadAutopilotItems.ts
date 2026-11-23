import { loadItem } from "../../../backlog/loadItem";
import { getReady } from "../../../backlog/shared";
import type { AutopilotStatus } from "../../daemon/autopilot/AutopilotStatus";
import type { AutopilotItemView } from "./AutopilotItemView";
import { commitDiffStat } from "./commitDiffStat";
import { toAutopilotItemView } from "./toAutopilotItemView";

export async function loadAutopilotItems(
	status: AutopilotStatus,
): Promise<AutopilotItemView[]> {
	if (status.items.length === 0) return [];
	const { orm } = await getReady();
	const views = await Promise.all(
		status.items.map(async (recorded) => {
			const item = await loadItem(orm, recorded.id);
			if (!item) return undefined;
			const shas = (item.gitRefs ?? [])
				.filter((ref) => ref.kind === "commit")
				.map((ref) => ref.ref);
			return toAutopilotItemView(
				item,
				recorded,
				commitDiffStat(status.cwd, shas),
			);
		}),
	);
	return views.filter((view) => view !== undefined);
}
