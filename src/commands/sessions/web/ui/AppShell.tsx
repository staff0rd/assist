import AppBar from "@mui/material/AppBar";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import { useLocation, useNavigate } from "react-router";
import { AppRoutes } from "./AppRoutes";

const TAB_PATHS = ["/sessions", "/backlog"] as const;

const appBarSx = {
	zIndex: (t: { zIndex: { drawer: number } }) => t.zIndex.drawer + 1,
} as const;
const toolbarSx = { minHeight: 48 } as const;

export function AppShell() {
	const location = useLocation();
	const navigate = useNavigate();
	const tabIndex = TAB_PATHS.findIndex((p) => location.pathname.startsWith(p));

	return (
		<>
			<AppBar position="fixed" elevation={1} sx={appBarSx}>
				<Toolbar variant="dense" sx={toolbarSx}>
					<Tabs
						value={tabIndex === -1 ? 0 : tabIndex}
						onChange={(_e, v) => navigate(TAB_PATHS[v])}
						textColor="inherit"
						indicatorColor="secondary"
						sx={{ flexGrow: 1 }}
					>
						<Tab label="Sessions" />
						<Tab label="Backlog" />
					</Tabs>
				</Toolbar>
			</AppBar>
			<Toolbar variant="dense" sx={toolbarSx} />
			<AppRoutes />
		</>
	);
}
