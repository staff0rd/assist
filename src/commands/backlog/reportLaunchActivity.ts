import { emitActivity } from "../../shared/emitActivity";
import type { HarnessActivityIdentity } from "../../shared/harnessAdapters/types";

export function reportLaunchActivity(
	slashCommand: string,
	identity: HarnessActivityIdentity,
	item?: { itemId?: number; itemName?: string },
): void {
	emitActivity({
		kind: "command",
		name: slashCommand,
		itemId: item?.itemId,
		itemName: item?.itemName,
		...identity,
	});
}
