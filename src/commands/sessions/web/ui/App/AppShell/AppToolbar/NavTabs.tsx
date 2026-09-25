import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useLocation, useNavigate } from "react-router";
import { useReleasesConfigured } from "./NavTabs/useReleasesConfigured";

type NavTab = { path: string; label: string };

const SESSIONS: NavTab = { path: "/sessions", label: "Sessions" };
const BACKLOG: NavTab = { path: "/backlog", label: "Backlog" };
const RELEASES: NavTab = { path: "/releases", label: "Releases" };
const NEWS: NavTab = { path: "/news", label: "News" };

function visibleTabs(releasesConfigured: boolean): NavTab[] {
	return releasesConfigured
		? [SESSIONS, BACKLOG, RELEASES, NEWS]
		: [SESSIONS, BACKLOG, NEWS];
}

export function NavTabs({ cwd }: { cwd: string }) {
	const location = useLocation();
	const navigate = useNavigate();
	const tabs = visibleTabs(useReleasesConfigured(cwd));
	const tabIndex = tabs.findIndex((t) => location.pathname.startsWith(t.path));

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
			{tabs.map((t) => (
				<Tab key={t.path} label={t.label} onClick={() => goTo(t.path)} />
			))}
		</Tabs>
	);
}
