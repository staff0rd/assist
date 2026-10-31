import semver from "semver";
import type { ExtensionUpdateStatus } from "../sessions/shared/ExtensionUpdateStatus";
import type { LatestSignedExtension } from "./fetchLatestSignedExtension";

export function extensionUpdateStatus(
	connected: string | undefined,
	latest: LatestSignedExtension["latest"],
): ExtensionUpdateStatus {
	const behind = Boolean(
		connected &&
		latest &&
		semver.valid(connected) &&
		semver.valid(latest.version) &&
		semver.gt(latest.version, connected),
	);
	return {
		connected,
		latest: latest?.version,
		updateLink: behind ? latest?.update_link : undefined,
		behind,
	};
}
