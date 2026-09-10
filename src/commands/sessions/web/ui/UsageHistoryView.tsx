import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useState } from "react";
import { PageShell } from "./PageShell";
import { UsageItemsPanel } from "./UsageItemsPanel";
import { UsagePeaksPanel } from "./UsagePeaksPanel";
import { useUsageHistoryPage } from "./useUsageHistoryPage";
import { useUsageItemsPage } from "./useUsageItemsPage";

type UsageTab = "limits" | "items";

const tabsSx = { borderBottom: 1, borderColor: "divider", mb: 2 } as const;

export function UsageHistoryView() {
	const [tab, setTab] = useState<UsageTab>("limits");
	const history = useUsageHistoryPage();
	const items = useUsageItemsPage(tab === "items");

	if (history.error) throw history.error;
	if (items.error) throw items.error;

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
			</Tabs>
			{tab === "limits" ? (
				<UsagePeaksPanel history={history} />
			) : (
				<UsageItemsPanel items={items} />
			)}
		</PageShell>
	);
}
