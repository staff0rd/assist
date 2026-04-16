import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import type { SidebarTab } from "./types";

const tabSx = { minHeight: 36, py: 0, fontSize: 12 } as const;

export function SidebarTabs({
	tab,
	activeCount,
	historyCount,
	onChange,
}: {
	tab: SidebarTab;
	activeCount: number;
	historyCount: number;
	onChange: (tab: SidebarTab) => void;
}) {
	const tabIndex = tab === "active" ? 0 : 1;
	return (
		<Tabs
			value={tabIndex}
			onChange={(_e, v: number) => onChange(v === 0 ? "active" : "history")}
			variant="fullWidth"
			sx={{ borderBottom: 1, borderColor: "divider", minHeight: 36 }}
		>
			<Tab label={`Active ${activeCount}`} sx={tabSx} />
			<Tab label={`History ${historyCount}`} sx={tabSx} />
		</Tabs>
	);
}
