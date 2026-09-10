import type { ItemUsageSortField } from "../../../../shared/db/parseItemUsageSort";

export type UsageItemColumn = {
	label: string;
	sort?: ItemUsageSortField;
	numeric?: boolean;
	tooltip?: string;
};

export const usageItemColumns: UsageItemColumn[] = [
	{ label: "Item" },
	{ label: "Repo" },
	{ label: "Status" },
	{ label: "Phases", sort: "phases", numeric: true },
	{
		label: "Active",
		sort: "active",
		numeric: true,
		tooltip:
			"Accumulated active time across the item's phases — not wall clock.",
	},
	{ label: "Tokens", sort: "tokens", numeric: true },
	{
		label: "Peak ctx",
		sort: "peakContext",
		numeric: true,
		tooltip: "The highest context-window usage any one phase reached.",
	},
	{
		label: "Last phase",
		sort: "lastPhase",
		numeric: true,
		tooltip: "When the item's most recent phase session started.",
	},
];
