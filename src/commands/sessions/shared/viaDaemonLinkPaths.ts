export const LINK_UPDATE_STATUS_PATH = "/api/updates/link-status";

export const RESTART_WEB_VIA_LINK_PATH = "/api/updates/restart-web";

export const viaDaemonLinkPaths: ReadonlySet<string> = new Set([
	LINK_UPDATE_STATUS_PATH,
	RESTART_WEB_VIA_LINK_PATH,
]);
