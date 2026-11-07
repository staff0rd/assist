import { emitActivity } from "../../shared/emitActivity";
import { harnessActivityFields } from "../../shared/harnessActivityFields";
import type { HarnessKind } from "../../shared/harnesses";

export function reportLaunchActivity(
	slashCommand: string,
	claudeSessionId: string,
	harness: HarnessKind,
	item?: { itemId?: number; itemName?: string; resumeSessionId?: string },
): void {
	emitActivity({
		kind: "command",
		name: slashCommand,
		itemId: item?.itemId,
		itemName: item?.itemName,
		...harnessActivityFields(harness, claudeSessionId, item?.resumeSessionId),
	});
}
