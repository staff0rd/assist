import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useLocation, useNavigate } from "react-router";

const TAB_PATHS = ["/sessions", "/backlog", "/news"] as const;

export function NavTabs() {
	const location = useLocation();
	const navigate = useNavigate();
	const tabIndex = TAB_PATHS.findIndex((p) => location.pathname.startsWith(p));

	// Tabs onChange doesn't fire when re-clicking the selected tab, so use
	// per-tab onClick to support navigating back to a section root (e.g. from
	// /backlog/items/:id to /backlog)
	const goTo = (path: string) => {
		if (location.pathname !== path) navigate(path);
	};

	return (
		<Tabs
			value={tabIndex === -1 ? 0 : tabIndex}
			textColor="inherit"
			indicatorColor="secondary"
		>
			<Tab label="Sessions" onClick={() => goTo("/sessions")} />
			<Tab label="Backlog" onClick={() => goTo("/backlog")} />
			<Tab label="News" onClick={() => goTo("/news")} />
		</Tabs>
	);
}
