export function parseRemoteHead(
	lsRemote: string,
): { branch: string; sha: string } | null {
	const branch = lsRemote.match(/^ref: refs\/heads\/(\S+)\s+HEAD$/m)?.[1];
	const sha = lsRemote.match(/^([0-9a-f]{40})\s+HEAD$/m)?.[1];
	return branch && sha ? { branch, sha } : null;
}
