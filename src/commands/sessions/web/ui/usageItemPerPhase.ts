import { formatTokens } from "../../../../shared/formatTokens";
import { formatActiveTime } from "../../../backlog/web/ui/components/formatActiveTime";
import type { UsageItemRow } from "./fetchUsageItems";

export function usageItemPerPhase(row: UsageItemRow): {
	active: string;
	tokens: string;
} {
	const phases = Math.max(1, row.recordedPhases);
	return {
		active: `${formatActiveTime(row.activeMs / phases)} / phase`,
		tokens: `${formatTokens(Math.round((row.tokensUp + row.tokensDown) / phases))} / phase`,
	};
}
