import Tabs from "@mui/material/Tabs";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { NavTab } from "./NavTabs/NavTab";
import { useAutopilotConfigured } from "./NavTabs/useAutopilotConfigured";
import { useInboxCount } from "./NavTabs/useInboxCount";
import { useNavTabHotkey } from "./NavTabs/useNavTabHotkey";
import { useNewsShownInNav } from "./NavTabs/useNewsShownInNav";
import { useReleasesConfigured } from "./NavTabs/useReleasesConfigured";
import { useUnconfiguredRedirect } from "./NavTabs/useUnconfiguredRedirect";
import { visibleTabs } from "./NavTabs/visibleTabs";

const navTabsSx = { mx: "6px" };

export function NavTabs({ cwd }: { cwd: string }) {
	const location = useLocation();
	const navigate = useNavigate();
	const releasesConfigured = useReleasesConfigured(cwd);
	const newsShownInNav = useNewsShownInNav();
	const inboxCount = useInboxCount();
	const autopilotConfigured = useAutopilotConfigured(cwd);
	useUnconfiguredRedirect(releasesConfigured, "/releases");
	useUnconfiguredRedirect(autopilotConfigured, "/autopilot");
	const showReleases = releasesConfigured === true;
	const showAutopilot = autopilotConfigured === true;
	const tabs = useMemo(
		() => visibleTabs(showReleases, newsShownInNav, showAutopilot),
		[showReleases, newsShownInNav, showAutopilot],
	);
	const paths = useMemo(() => tabs.map((t) => t.path), [tabs]);
	const tabIndex = tabs.findIndex((t) => location.pathname.startsWith(t.path));

	// Tabs onChange doesn't fire when re-clicking the selected tab, so use
	// per-tab onClick to support navigating back to a section root (e.g. from
	// /backlog/items/:id to /backlog)
	const goTo = useCallback(
		(path: string) => {
			if (location.pathname !== path) navigate(path);
		},
		[location.pathname, navigate],
	);
	useNavTabHotkey(paths, goTo);

	return (
		<Tabs
			sx={navTabsSx}
			value={tabIndex === -1 ? false : tabIndex}
			textColor="inherit"
			indicatorColor="secondary"
		>
			{tabs.map((t, index) => (
				<NavTab
					key={t.path}
					index={index}
					label={t.label}
					count={t.path === "/inbox" ? inboxCount : undefined}
					onClick={() => goTo(t.path)}
				/>
			))}
		</Tabs>
	);
}
