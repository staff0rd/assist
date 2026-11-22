type NavTab = { path: string; label: string };

const SESSIONS: NavTab = { path: "/sessions", label: "Sessions" };
const BACKLOG: NavTab = { path: "/backlog", label: "Backlog" };
const NEXT: NavTab = { path: "/next", label: "Next" };
const RELEASES: NavTab = { path: "/releases", label: "Releases" };
const NEWS: NavTab = { path: "/news", label: "News" };
const INBOX: NavTab = { path: "/inbox", label: "Inbox" };
const AUTOPILOT: NavTab = { path: "/autopilot", label: "Autopilot" };

export function visibleTabs(
	releasesConfigured: boolean,
	newsShownInNav: boolean,
	autopilotConfigured = false,
): NavTab[] {
	return [
		SESSIONS,
		BACKLOG,
		NEXT,
		...(autopilotConfigured ? [AUTOPILOT] : []),
		...(releasesConfigured ? [RELEASES] : []),
		...(newsShownInNav ? [NEWS] : []),
		INBOX,
	];
}
