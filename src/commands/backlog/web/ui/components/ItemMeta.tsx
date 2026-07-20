import { Chip, Stack, Typography } from "@mui/material";
import { formatItemId } from "../../../formatItemId";
import type { BacklogItem } from "../types";
import { GithubIssueLink } from "./GithubIssueLink";
import { JiraKeyLink } from "./JiraKeyLink";
import { StatusPicker } from "./StatusPicker";
import { typeChipColors } from "./typeChipColors";
import { UsageSummary } from "./UsageSummary";

const metaRowSx = {
	alignItems: "center",
	color: "text.disabled",
	fontSize: "0.875rem",
} as const;

const chipSx = {
	fontWeight: 500,
	fontSize: "0.75rem",
} as const;

const usageSx = { color: "text.secondary", fontSize: "0.75rem" } as const;

export function ItemMeta({
	item,
	onStatusChange,
}: {
	item: BacklogItem;
	onStatusChange?: (status: BacklogItem["status"]) => void;
}) {
	const color = typeChipColors[item.type];
	return (
		<Stack direction="row" spacing={1} sx={metaRowSx}>
			<Typography variant="body2" color="text.disabled">
				{formatItemId(item.id)}
			</Typography>
			{color && (
				<Chip label={item.type} size="small" color={color} sx={chipSx} />
			)}
			<StatusPicker current={item.status} onStatusChange={onStatusChange} />
			<JiraKeyLink jiraKey={item.jiraKey} />
			<GithubIssueLink githubIssue={item.githubIssue} origin={item.origin} />
			{item.usageTotal && <UsageSummary total={item.usageTotal} sx={usageSx} />}
		</Stack>
	);
}
