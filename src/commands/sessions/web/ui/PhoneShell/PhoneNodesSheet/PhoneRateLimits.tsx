import { harnessLabel } from "../../../../../../shared/harnessLabel";
import type {
	HarnessRateLimits,
	RateLimits,
} from "../../../../../../shared/RateLimits";
import { formatRateLimitTimeLeft } from "../../../../../../shared/rateLimitLevel";
import { harnessLimitGroups } from "../../App/AppShell/AppToolbar/RateLimitsIndicator/harnessLimitGroups";
import { rateLimitTooltipRows } from "../../App/AppShell/AppToolbar/RateLimitsIndicator/RateLimitTooltipList/rateLimitTooltipRows";
import { useNowSeconds } from "../../App/useNowSeconds";
import { PhoneValueGroup } from "./PhoneValueGroup";

type Props = {
	rateLimits: RateLimits | null;
	harnessRateLimits: HarnessRateLimits;
};

export function PhoneRateLimits({ rateLimits, harnessRateLimits }: Props) {
	const now = useNowSeconds(30_000);
	const rows = harnessLimitGroups(rateLimits, harnessRateLimits).flatMap(
		(group) =>
			rateLimitTooltipRows(group.rateLimits).map((row) => ({
				key: `${group.harness}-${row.label}`,
				label: `${harnessLabel(group.harness)} · ${row.label}`,
				value:
					row.resetsAt != null
						? `${Math.round(row.pct)}% · ${formatRateLimitTimeLeft(row.resetsAt, now)}`
						: `${Math.round(row.pct)}%`,
			})),
	);
	if (rows.length === 0) return null;
	return <PhoneValueGroup title="Rate limits" rows={rows} />;
}
