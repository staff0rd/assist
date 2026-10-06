import type { SessionInfo } from "../../../../types";

const GITHUB_PREFIX = "github.com/";

export function sessionRepo(session: SessionInfo): string | undefined {
	const origin = (
		session.remoteOrigin ?? session.repoGroup?.origin
	)?.toLowerCase();
	return origin?.startsWith(GITHUB_PREFIX)
		? origin.slice(GITHUB_PREFIX.length)
		: undefined;
}
