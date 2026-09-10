import { Box, Tooltip } from "@mui/material";
import { formatItemId } from "../../../formatItemId";
import type { BacklogItemSummary } from "../types";
import { formatActiveTime } from "./formatActiveTime";
import { formatUsageSummary } from "./formatUsageSummary";
import { GithubIssueLink } from "./GithubIssueLink";
import { itemCardStyles } from "./itemCardStyles";
import { JiraKeyLink } from "./JiraKeyLink";
import { typeChipColors } from "./typeChipColors";

const typeSx = { display: "inline-flex", alignItems: "center", gap: 0.5 };
const dotSx = { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 };
const activeTimeSx = { whiteSpace: "nowrap" };

function TypeLabel({ type }: { type: BacklogItemSummary["type"] }) {
	const color = typeChipColors[type];
	return (
		<Box component="span" sx={typeSx}>
			<Box component="span" sx={{ ...dotSx, bgcolor: `${color}.main` }} />
			{type}
		</Box>
	);
}

function ActiveTime({ item }: { item: BacklogItemSummary }) {
	if (!item.usageTotal) return null;
	return (
		<Tooltip title={formatUsageSummary(item.usageTotal)}>
			<Box component="span" sx={activeTimeSx}>
				{`⏱ ${formatActiveTime(item.usageTotal.activeMs)}`}
			</Box>
		</Tooltip>
	);
}

export function ItemCardMeta({ item }: { item: BacklogItemSummary }) {
	return (
		<Box sx={itemCardStyles.meta}>
			<Box component="span" sx={itemCardStyles.id}>
				{formatItemId(item.id)}
			</Box>
			<TypeLabel type={item.type} />
			<JiraKeyLink jiraKey={item.jiraKey} />
			<GithubIssueLink githubIssue={item.githubIssue} origin={item.origin} />
			<ActiveTime item={item} />
		</Box>
	);
}
