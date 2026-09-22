import { getRepoInfo } from "../prs/shared";

export function withCurrentRepo(
	streams: Record<string, unknown>[],
): Record<string, unknown>[] {
	if (streams.every((stream) => typeof stream.repo === "string"))
		return streams;
	const { org, repo } = getRepoInfo();
	return streams.map((stream) => ({ repo: `${org}/${repo}`, ...stream }));
}
