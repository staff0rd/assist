import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { SidebarCollapseToggle } from "../../../../SidebarCollapseToggle";
import type { SidebarTab } from "../../../../../../types";
import { useSidebarCollapsedContext } from "../../../../useSidebarCollapsedContext";

const tabSx = { minHeight: 36, py: 0, fontSize: 12 } as const;
const rowSx = {
	display: "flex",
	alignItems: "center",
	minHeight: 36,
	borderBottom: 1,
	borderColor: "divider",
} as const;
const tabsSx = { flex: 1, minWidth: 0, minHeight: 36 } as const;

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
	const { collapsed, onToggleCollapsed } = useSidebarCollapsedContext();
	const tabIndex = tab === "active" ? 0 : 1;
	return (
		<Box sx={rowSx}>
			<SidebarCollapseToggle
				collapsed={collapsed}
				onToggleCollapsed={onToggleCollapsed}
				size="small"
			/>
			<Tabs
				value={tabIndex}
				onChange={(_e, v: number) => onChange(v === 0 ? "active" : "history")}
				variant="fullWidth"
				sx={tabsSx}
			>
				<Tab label={`Active ${activeCount}`} sx={tabSx} />
				<Tab label={`History ${historyCount}`} sx={tabSx} />
			</Tabs>
		</Box>
	);
}
