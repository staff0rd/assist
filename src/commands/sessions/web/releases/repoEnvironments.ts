import type { ReleaseStream } from "../../../../shared/types";
import { streamEnvironments } from "./streamEnvironments";

export function repoEnvironments(
	streams: ReleaseStream[],
): Map<string, string[]> {
	const byRepo = new Map<string, Set<string>>();
	for (const stream of streams) {
		const environments = byRepo.get(stream.repo) ?? new Set<string>();
		for (const environment of streamEnvironments(stream))
			environments.add(environment);
		byRepo.set(stream.repo, environments);
	}
	return new Map(
		[...byRepo].map(([repo, environments]) => [repo, [...environments].sort()]),
	);
}
