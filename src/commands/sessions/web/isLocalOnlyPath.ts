import { viaDaemonLinkPaths } from "../shared/viaDaemonLinkPaths";

const LOCAL_NODES_PREFIX = "/api/nodes/";

export function isLocalOnlyPath(pathname: string): boolean {
	return (
		viaDaemonLinkPaths.has(pathname) || pathname.startsWith(LOCAL_NODES_PREFIX)
	);
}
