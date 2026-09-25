import Box from "@mui/material/Box";
import { SidebarBody } from "./Sidebar/SidebarBody";
import { SidebarTabs } from "./Sidebar/SidebarTabs";
import type { SidebarProps } from "../../types";

const sidebarSx = {
	width: 400,
	flexShrink: 0,
	borderRight: 1,
	borderColor: "divider",
	display: "flex",
	flexDirection: "column",
	bgcolor: "background.paper",
} as const;
const collapsedSx = { display: "none" } as const;

export function Sidebar(props: SidebarProps) {
	return (
		<Box sx={props.collapsed ? collapsedSx : sidebarSx}>
			<SidebarTabs
				tab={props.tab}
				activeCount={props.sessions.length}
				historyCount={props.history.length}
				onChange={props.onTabChange}
			/>

			<SidebarBody {...props} />
		</Box>
	);
}
