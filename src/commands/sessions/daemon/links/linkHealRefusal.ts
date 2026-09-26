import semver from "semver";
import { ASSIST_VERSION } from "../buildHello";

function peerIsNewer(peerVersion: string): boolean {
	return (
		semver.valid(peerVersion) !== null &&
		semver.valid(ASSIST_VERSION) !== null &&
		semver.gt(peerVersion, ASSIST_VERSION)
	);
}

export function linkHealRefusal(
	node: string,
	peerVersion: string,
	healAttempted: boolean,
): string | undefined {
	if (peerIsNewer(peerVersion))
		return `This node (${ASSIST_VERSION}) is older than ${node} (${peerVersion}); update this node and restart its daemon.`;
	if (healAttempted)
		return `${node} is still on ${peerVersion} after auto-update (this node is ${ASSIST_VERSION}); update ${node} manually, then restart this daemon.`;
	return undefined;
}
