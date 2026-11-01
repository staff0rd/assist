import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useState } from "react";
import { PageShell } from "./PageShell";
import { UsageItemsPanel } from "./UsageHistoryView/UsageItemsPanel";
import { UsageJobsPanel } from "./UsageHistoryView/UsageJobsPanel";
import { UsagePeaksPanel } from "./UsageHistoryView/UsagePeaksPanel";
import { useUsageHistoryPage } from "./UsageHistoryView/useUsageHistoryPage";
import { useUsageItemsPage } from "./UsageHistoryView/useUsageItemsPage";
import { useUsageJobsPage } from "./UsageHistoryView/useUsageJobsPage";

type UsageTab = "limits" | "items" | "jobs";

const tabsSx = { borderBottom: 1, borderColor: "divider", mb: 2 } as const;

export function UsageHistoryView() {
	const [tab, setTab] = useState<UsageTab>("limits");
	const history = useUsageHistoryPage();
	const items = useUsageItemsPage(tab === "items");
	const jobs = useUsageJobsPage(tab === "jobs");

	if (history.error) throw history.error;
	if (items.error) throw items.error;
	if (jobs.error) throw jobs.error;

	return (
		<PageShell loading={!history.loaded} title="Usage history" maxWidth="lg">
			<Tabs
				value={tab}
				onChange={(_, next: UsageTab) => setTab(next)}
				textColor="inherit"
				indicatorColor="secondary"
				sx={tabsSx}
				aria-label="Usage history views"
			>
				<Tab label="Rate limits" value="limits" />
				<Tab label="Items" value="items" />
				<Tab label="Jobs" value="jobs" />
			</Tabs>
			{tab === "limits" && <UsagePeaksPanel history={history} />}
			{tab === "items" && <UsageItemsPanel items={items} />}
			{tab === "jobs" && <UsageJobsPanel jobs={jobs} />}
		</PageShell>
	);
}
